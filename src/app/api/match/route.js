import { matchDogsToAdopter } from '@/lib/ai/match';
import { sql } from '@/lib/db';
import { describePhoto, findSimilarDogs } from '@/lib/ai/vision';

export async function POST(request) {
  const { profile, shelterId, dogPostIds, referencePhoto } = await request.json();

  if (!profile) {
    return Response.json({ error: 'Profile is required' }, { status: 400 });
  }

  try {
    // Fetch dogs — fall back to empty (ideal mode) if DB is unavailable
    let dogs = [];
    try {
      if (shelterId) {
        const shelterRows = await sql`
          SELECT * FROM shelter_dogs_cache
          WHERE shelter_id = ${shelterId} AND status = 'available'
          ORDER BY created_at DESC
        `;
        dogs = shelterRows;
      }

      if (dogPostIds?.length > 0) {
        const posts = await sql`
          SELECT * FROM dog_posts
          WHERE id = ANY(${dogPostIds}) AND status = 'available'
        `;
        dogs = [...dogs, ...posts];
      } else if (!shelterId) {
        const posts = await sql`
          SELECT * FROM dog_posts
          WHERE status = 'available'
          ORDER BY created_at DESC
          LIMIT 50
        `;
        dogs = posts;
      }
    } catch {
      // DB unavailable — proceed with ideal mode (no real dogs)
    }

    const matchResult = await matchDogsToAdopter(profile, dogs);

    // Enrich AI matches with actual dog data (name, breed, sex, photos)
    if (matchResult.matches) {
      matchResult.matches = matchResult.matches.map(m => {
        const dog = dogs.find(d => d.id === m.dogId);
        if (!dog) return m;
        const photos = typeof dog.photos === 'string' ? JSON.parse(dog.photos) : (dog.photos || []);
        return {
          ...m,
          name: dog.name,
          breed: dog.breed,
          sex: dog.sex,
          ageApprox: dog.age_months,
          origin: dog.origin,
          photo: photos[0] || null,
        };
      });
    }

    // If a reference photo was provided, run visual matching too
    let photoMatches = null;
    if (referencePhoto && process.env.GROQ_API_KEY && dogs.length > 0) {
      try {
        const searchDesc = await describePhoto(referencePhoto);
        if (searchDesc) {
          const dogsWithDescriptions = dogs
            .filter(d => {
              const descs = typeof d.photo_descriptions === 'string'
                ? JSON.parse(d.photo_descriptions)
                : (d.photo_descriptions || []);
              return descs.length > 0;
            })
            .map(d => {
              const photos = typeof d.photos === 'string' ? JSON.parse(d.photos) : (d.photos || []);
              const descriptions = typeof d.photo_descriptions === 'string'
                ? JSON.parse(d.photo_descriptions)
                : (d.photo_descriptions || []);
              return { id: d.id, name: d.name, breed: d.breed, photo: photos[0] || null, descriptions };
            });

          if (dogsWithDescriptions.length > 0) {
            photoMatches = await findSimilarDogs(searchDesc, dogsWithDescriptions, 10);
          }
        }
      } catch (err) {
        console.error('[api/match] Photo matching failed:', err.message);
      }
    }

    const sessionId = crypto.randomUUID();
    const result = { ...matchResult, photoMatches };

    // Persist session — skip silently if DB is unavailable
    try {
      await sql`
        INSERT INTO match_sessions (id, profile, result, shelter_id)
        VALUES (${sessionId}, ${JSON.stringify(profile)}, ${JSON.stringify(result)}, ${shelterId ?? null})
      `;
    } catch {
      // DB unavailable — session lives in sessionStorage only
    }

    return Response.json({ sessionId, ...result });
  } catch (err) {
    console.error('[api/match]', err.message);
    return Response.json({ error: 'Matching failed' }, { status: 500 });
  }
}
