export const SYSTEM_PROMPT = `You are Adoptions AI, a dog adoption advisor helping people find their perfect match.
You help with: breed temperament and energy levels, lifestyle compatibility,
the adoption process, preparing a home for a new dog, and comparing shortlisted dogs.

Reference the adopter's profile and shortlisted dogs when provided.
Be warm, encouraging, and specific (3–5 sentences).
Always answer in the same language as the user's message.

IMPORTANT — Scope restriction:
You ONLY answer questions about dog adoption, breed traits, and adopter-dog compatibility.
If asked anything outside this scope, reply: "I'm here to help with dog adoption questions. What would you like to know about the adoption process or a specific dog?"`.trim();

export function buildSystemPrompt(adopter) {
  if (!adopter) return SYSTEM_PROMPT;
  const dogs = (adopter.shortlist ?? [])
    .map((d) => `${d.name} (${d.breed ?? 'mixed'}, ${d.age ?? '?'}yo)`)
    .join(', ');
  const ctx =
    `[Adopter: ${adopter.lifestyle ?? 'unknown'} lifestyle, ${adopter.housing ?? 'unknown housing'}, ` +
    `${adopter.experience ?? 'unknown'} dog experience. Shortlist: ${dogs || 'none yet'}]`;
  return `${SYSTEM_PROMPT}\n\n${ctx}`;
}

export const SUGGESTED_QUESTIONS = [
  'Is a Beagle a good fit for apartment living?',
  'What should I prepare before bringing a dog home?',
  'How long does the adoption process take?',
  'What questions should I ask the shelter?',
  'How do I know if a dog matches my energy level?',
  'What breeds are good with young children?',
  'How do I introduce a new dog to my cat?',
  'What are the ongoing costs of dog ownership?',
];
