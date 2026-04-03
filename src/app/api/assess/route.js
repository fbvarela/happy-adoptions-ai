import { assessDogForAdoption } from '@/lib/ai/match';

export async function POST(request) {
  const dog = await request.json();

  if (!dog.name && !dog.breed) {
    return Response.json({ error: 'Provide at least a name or breed' }, { status: 400 });
  }

  try {
    const result = await assessDogForAdoption(dog);
    return Response.json(result);
  } catch (err) {
    console.error('[api/assess]', err.message);
    return Response.json({ error: 'Assessment failed' }, { status: 500 });
  }
}
