import { sql } from '@/lib/db';
import { describeDogPhotos } from '@/lib/ai/vision';

/**
 * POST /api/photo-describe
 * Backfill photo descriptions for all dogs that have photos but no descriptions.
 * Can also describe a single dog by passing { dogId }.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    let rows;
    if (body.dogId) {
      rows = await sql`
        SELECT id, name, photos FROM dog_posts
        WHERE id = ${body.dogId}
          AND photos IS NOT NULL AND photos != '[]'::jsonb
      `;
    } else {
      rows = await sql`
        SELECT id, name, photos FROM dog_posts
        WHERE photos IS NOT NULL AND photos != '[]'::jsonb
          AND (photo_descriptions IS NULL OR photo_descriptions = '[]'::jsonb)
        LIMIT 20
      `;
    }

    if (rows.length === 0) {
      return Response.json({ message: 'No dogs need photo descriptions', processed: 0 });
    }

    const results = [];
    for (const row of rows) {
      const photos = typeof row.photos === 'string' ? JSON.parse(row.photos) : (row.photos || []);
      if (photos.length === 0) continue;

      try {
        console.log(`[photo-describe] Processing ${row.name} (${row.id}), ${photos.length} photo(s), first photo size: ${Math.round(photos[0].length / 1024)}KB`);
        const descriptions = await describeDogPhotos(photos);
        console.log(`[photo-describe] Got ${descriptions.length} descriptions for ${row.name}`);
        if (descriptions.length > 0) {
          await sql`
            UPDATE dog_posts
            SET photo_descriptions = ${JSON.stringify(descriptions)}
            WHERE id = ${row.id}
          `;
          results.push({ id: row.id, name: row.name, descriptions: descriptions.length });
        } else {
          results.push({ id: row.id, name: row.name, error: 'No descriptions generated' });
        }
      } catch (err) {
        results.push({ id: row.id, name: row.name, error: err.message });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (err) {
    console.error('[api/photo-describe]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
