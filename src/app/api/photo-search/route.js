import { sql } from '@/lib/db';
import { describePhoto, findSimilarDogs } from '@/lib/ai/vision';

export async function POST(request) {
  try {
    const { photo, limit = 10 } = await request.json();

    if (!photo) {
      return Response.json({ error: 'photo is required' }, { status: 400 });
    }

    // 1. Describe the search photo via Groq vision
    const searchDescription = await describePhoto(photo);
    if (!searchDescription) {
      return Response.json({ error: 'Could not analyze photo' }, { status: 422 });
    }

    // 2. Fetch dogs that have photo descriptions
    const rows = await sql`
      SELECT id, name, breed, photos, photo_descriptions
      FROM dog_posts
      WHERE status = 'available'
        AND photo_descriptions IS NOT NULL
        AND photo_descriptions != '[]'::jsonb
      ORDER BY created_at DESC
      LIMIT 100
    `;

    if (rows.length === 0) {
      return Response.json({
        matches: [],
        searchDescription,
        message: 'No dogs with photo descriptions found. Dogs need photos to be searchable.',
      });
    }

    // 3. Build dog list for comparison
    const dogs = rows.map(row => {
      const photos = typeof row.photos === 'string' ? JSON.parse(row.photos) : (row.photos || []);
      const descriptions = typeof row.photo_descriptions === 'string'
        ? JSON.parse(row.photo_descriptions)
        : (row.photo_descriptions || []);
      return {
        id: row.id,
        name: row.name,
        breed: row.breed,
        photo: photos[0] || null,
        descriptions,
      };
    });

    // 4. Rank by visual similarity via Cohere
    const matches = await findSimilarDogs(searchDescription, dogs, limit);

    return Response.json({ matches, searchDescription });
  } catch (err) {
    console.error('[api/photo-search]', err);
    return Response.json({ error: 'Photo search failed' }, { status: 500 });
  }
}
