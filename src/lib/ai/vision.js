import Groq from 'groq-sdk';
import { CohereClientV2 } from 'cohere-ai';
import sharp from 'sharp';
import { getEnv } from '@/lib/env';

let _groq;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: getEnv('GROQ_API_KEY') });
  return _groq;
}

let _cohere;
function getCohere() {
  if (!_cohere) _cohere = new CohereClientV2({ token: getEnv('COHERE_API_KEY') });
  return _cohere;
}

/**
 * Compress a base64 data URL image server-side using sharp.
 * Returns a small JPEG data URL safe for Groq vision (< 200KB).
 */
async function compressForVision(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const compressed = await sharp(buffer)
    .resize(384, 384, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 50 })
    .toBuffer();
  return `data:image/jpeg;base64,${compressed.toString('base64')}`;
}

const DESCRIBE_PROMPT = `You are a dog identification expert. Describe this dog's visual traits in structured JSON. Be specific and concise.

Return ONLY valid JSON:
{
  "size_estimate": "small | medium | large",
  "coat_type": "short | medium | long | wire | curly | hairless",
  "coat_colors": ["primary color", "secondary color"],
  "coat_pattern": "solid | bicolor | tricolor | spotted | brindle | merle | tuxedo",
  "ear_type": "floppy | erect | semi-erect | rose",
  "face_shape": "round | long | flat | square",
  "build": "slim | athletic | stocky | heavy",
  "tail": "long | short | curled | docked | bushy",
  "distinguishing_features": ["feature1", "feature2"],
  "breed_guess": "best guess breed or mix"
}`;

/**
 * Describe a single dog photo using Groq vision.
 * @param {string} base64DataUrl - The photo as a data URL (data:image/...;base64,...)
 * @returns {object} Structured visual description
 */
export async function describePhoto(base64DataUrl) {
  const compressed = await compressForVision(base64DataUrl);
  console.log('[vision] Compressed image size:', Math.round(compressed.length / 1024), 'KB');
  const response = await getGroq().chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: DESCRIBE_PROMPT },
          { type: 'image_url', image_url: { url: compressed } },
        ],
      },
    ],
    max_tokens: 512,
    temperature: 0.2,
  });

  const text = response.choices?.[0]?.message?.content || '';
  console.log('[vision] Groq response:', text.slice(0, 300));
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[vision] Failed to parse description:', err.message, '| Raw:', text.slice(0, 300));
    return null;
  }
}

/**
 * Describe all photos for a dog post. Returns array of descriptions.
 * Skips photos that fail to process.
 * @param {string[]} photos - Array of base64 data URLs
 * @returns {object[]} Array of description objects
 */
export async function describeDogPhotos(photos) {
  if (!photos?.length) return [];

  const descriptions = [];
  for (let i = 0; i < photos.length; i++) {
    try {
      console.log(`[vision] Describing photo ${i + 1}/${photos.length}, size: ${Math.round(photos[i].length / 1024)}KB`);
      const desc = await describePhoto(photos[i]);
      if (desc) {
        descriptions.push(desc);
        console.log(`[vision] Photo ${i + 1} described successfully`);
      } else {
        console.log(`[vision] Photo ${i + 1} returned null`);
      }
    } catch (err) {
      console.error(`[vision] Error describing photo ${i + 1}:`, err.message);
    }
  }
  return descriptions;
}

/**
 * Given a search photo description and a list of dogs with their descriptions,
 * use Cohere to rank dogs by visual similarity.
 * @param {object} searchDescription - Description of the search photo
 * @param {Array<{id: string, name: string, breed: string, photo: string, descriptions: object[]}>} dogs
 * @param {number} limit - Max results to return
 * @returns {Array<{dogId: string, name: string, similarity: number, matchedTraits: string[], photo: string, breed: string}>}
 */
export async function findSimilarDogs(searchDescription, dogs, limit = 10) {
  if (!dogs.length) return [];

  const dogsForPrompt = dogs.map(d => ({
    id: d.id,
    name: d.name,
    breed: d.breed,
    descriptions: d.descriptions,
  }));

  const prompt = `You are a dog visual matching expert. Compare the search dog's appearance against the candidate dogs and score each by visual similarity.

## Search Dog Appearance
${JSON.stringify(searchDescription, null, 2)}

## Candidate Dogs
${JSON.stringify(dogsForPrompt, null, 2)}

## Task
Score each candidate dog from 0–100 based on how visually similar they are to the search dog. Consider: coat color, coat type, size, build, ear type, face shape, and overall appearance.

Return ONLY valid JSON:
{
  "matches": [
    {
      "dogId": "uuid",
      "similarity": 85,
      "matchedTraits": ["brown coat", "medium size", "floppy ears"]
    }
  ]
}

Sort by similarity descending. Include all dogs. Top ${limit} only.`;

  const response = await getCohere().chat({
    model: 'command-a-03-2025',
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 2048,
  });

  const text = response.message?.content?.[0]?.text || '';
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const parsed = JSON.parse(jsonMatch[0]);

    // Enrich results with dog data
    return (parsed.matches || []).map(m => {
      const dog = dogs.find(d => d.id === m.dogId);
      return {
        dogId: m.dogId,
        name: dog?.name || 'Unknown',
        similarity: m.similarity,
        matchedTraits: m.matchedTraits || [],
        photo: dog?.photo || null,
        breed: dog?.breed || null,
      };
    });
  } catch {
    console.error('[vision] Failed to parse similarity results:', text.slice(0, 200));
    return [];
  }
}
