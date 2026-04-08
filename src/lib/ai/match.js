import { CohereClientV2 } from 'cohere-ai';

const client = new CohereClientV2({ token: process.env.COHERE_API_KEY });

/**
 * Given an adopter profile and a list of dogs, returns ranked matches with
 * scores and explanations. Works in two modes:
 *
 * - With dogs: scores and ranks each dog against the adopter profile
 * - Without dogs (ideal mode): returns breed/type recommendations only
 */
export async function matchDogsToAdopter(profile, dogs = []) {
  const idealMode = dogs.length === 0;

  const prompt = idealMode
    ? buildIdealModePrompt(profile)
    : buildMatchPrompt(profile, dogs);

  const response = await client.chat({
    model: 'command-a-03-2025',
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 2048,
  });

  const text = response.message?.content?.[0]?.text || '';
  return parseResponse(text, idealMode);
}

function buildMatchPrompt(profile, dogs) {
  return `You are a dog adoption matching expert. Analyze the adopter profile and rank the dogs by compatibility.

## Adopter Profile
${JSON.stringify(profile, null, 2)}

## Available Dogs
${JSON.stringify(dogs.map(d => ({
  id: d.id,
  name: d.name,
  breed: d.breed,
  sex: d.sex,
  ageApprox: d.age_months,
  weight: d.weight,
  color: d.color,
  origin: d.origin,
  temperament: d.temperament,
  isVaccinated: d.is_vaccinated,
  isSterilized: d.is_sterilized,
  specialNeeds: d.special_needs,
  description: d.description,
})), null, 2)}

## Task
Score each dog from 0–100 for compatibility with this adopter. Consider:
- Household composition (kids, other pets)
- Housing type and space
- Activity level and lifestyle
- Dog experience and training ability
- Adopter preferences (size, age, energy)
- Dog's origin (street dogs may need more patience, shelter dogs may have unknown history)
- Any deal-breakers

Return ONLY valid JSON in this exact format:
{
  "matches": [
    {
      "dogId": "uuid",
      "matchPercentage": 87,
      "reasons": ["Good with kids", "Low energy matches your lifestyle"],
      "dealBreakers": ["Needs experienced owner"],
      "summary": "One sentence explaining why this is a good match."
    }
  ]
}

Sort by matchPercentage descending. Include all dogs.`;
}

function buildIdealModePrompt(profile) {
  return `You are a dog adoption expert. Based on this adopter profile, recommend the ideal dog types/breeds.

## Adopter Profile
${JSON.stringify(profile, null, 2)}

## Task
Recommend 3–5 ideal dog types or breeds for this person. Be specific and explain the why.

Return ONLY valid JSON in this exact format:
{
  "idealProfile": {
    "summary": "2-3 sentence description of the ideal dog for this adopter",
    "recommendations": [
      {
        "type": "Golden Retriever",
        "matchPercentage": 92,
        "reasons": ["Gentle with kids", "Moderate energy matches your activity level"],
        "considerations": ["Needs daily exercise", "Heavy shedder"]
      }
    ],
    "tips": ["What to ask a shelter when you visit", "..."]
  }
}`;
}

function parseResponse(text, idealMode) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    if (idealMode) {
      return { idealProfile: { summary: 'Unable to generate recommendations.', recommendations: [], tips: [] } };
    }
    return { matches: [] };
  }
}

/**
 * Given a dog's profile entered by a volunteer, returns an ideal adopter profile
 * describing what kind of home this dog needs.
 */
export async function assessDogForAdoption(dogProfile) {
  const response = await client.chat({
    model: 'command-a-03-2025',
    messages: [{ role: 'user', content: buildAssessmentPrompt(dogProfile) }],
    maxTokens: 1536,
  });
  return parseAssessmentResponse(response.message?.content?.[0]?.text || '');
}

function buildAssessmentPrompt(dog) {
  return `You are a dog adoption expert helping a shelter volunteer write an ideal adopter profile for a dog in their care.

## Dog Profile
${JSON.stringify(dog, null, 2)}

## Task
Analyse this dog and generate a detailed ideal adopter profile describing:
1. What type of home and lifestyle suits this dog best
2. Any deal-breakers (e.g. no small kids, needs garden)
3. Experience level required
4. Consider the dog's origin (street/shelter/previous owner) — street dogs may need patience with socialisation, shelter dogs may have unknown history, dogs from previous owners may adapt faster
5. Tips for the volunteer when screening adopters

Return ONLY valid JSON:
{
  "idealAdopter": {
    "summary": "2-3 sentence description of the ideal home for this dog",
    "requirements": [
      { "label": "Active lifestyle", "reason": "This breed needs 2+ hours of exercise daily" }
    ],
    "dealBreakers": ["Households with children under 5", "Apartment without outdoor access"],
    "screeningTips": ["Ask about their previous dog experience", "..."],
    "matchScore": {
      "experienceRequired": "beginner | intermediate | experienced",
      "activityLevel": "low | medium | high",
      "spaceRequired": "apartment | house-no-garden | house-with-garden"
    }
  }
}`;
}

function parseAssessmentResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { idealAdopter: { summary: 'Unable to generate assessment.', requirements: [], dealBreakers: [], screeningTips: [] } };
  }
}

/**
 * Given an adopter profile, returns volunteer role suggestions ranked by fit.
 */
export async function matchVolunteerOpportunities(profile) {
  const response = await client.chat({
    model: 'command-a-03-2025',
    messages: [{ role: 'user', content: buildVolunteerPrompt(profile) }],
    maxTokens: 1024,
  });
  return parseVolunteerResponse(response.message?.content?.[0]?.text || '');
}

function buildVolunteerPrompt(profile) {
  return `You are a shelter volunteer coordinator. Based on this adopter profile, suggest volunteer opportunities that match their lifestyle.

## Adopter Profile
${JSON.stringify(profile, null, 2)}

## Volunteer Roles Available
- Dog Walker: Walk dogs at the shelter (30–90 min sessions, a few times per week)
- Foster Carer: Temporarily house a dog for 2–8 weeks at home
- Shelter Assistant: Help with feeding, cleaning, and socialising dogs on-site
- Event Volunteer: Help at adoption fairs, fundraisers, and community pop-ups
- Transport Volunteer: Drive dogs between shelters or to vet appointments
- Photography Volunteer: Take profile photos of dogs to improve their adoption listings

## Task
Recommend the top 3 volunteer roles that best fit this person. Consider their activity level, housing situation, schedule, dog experience, and any household constraints (kids, other pets).

Return ONLY valid JSON:
{
  "volunteerMatches": [
    {
      "role": "Dog Walker",
      "matchPercentage": 90,
      "reasons": ["Your active lifestyle is a great fit", "Flexible hours suit your schedule"],
      "commitment": "2–3 hours per week"
    }
  ]
}`;
}

function parseVolunteerResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { volunteerMatches: [] };
  }
}
