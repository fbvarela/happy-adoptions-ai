import { assessDogForAdoption } from '@/lib/ai/match';

export async function POST(request) {
  const body = await request.json();
  const { locale, ...dog } = body;

  if (!dog.name && !dog.breed) {
    return Response.json({ error: 'Provide at least a name or breed' }, { status: 400 });
  }

  try {
    const result = await assessDogForAdoption(dog, { locale: locale || 'en' });
    return Response.json(result);
  } catch (err) {
    console.error('[api/assess]', err.message);
    return Response.json({ error: 'Assessment failed' }, { status: 500 });
  }
}
