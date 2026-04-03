import { matchDogsToAdopter } from '@/lib/ai/match';
import { sql } from '@/lib/db';

export async function POST(request) {
  const { profile, shelterId, dogPostIds } = await request.json();

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

    const sessionId = crypto.randomUUID();
    const result = matchResult;

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
