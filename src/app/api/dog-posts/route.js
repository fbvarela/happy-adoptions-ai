import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { describeDogPhotos } from '@/lib/ai/vision';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const offset = parseInt(searchParams.get('offset') ?? '0');
  const mine = searchParams.get('mine') === 'true';

  if (mine) {
    const { session, error } = await requireAuth();
    if (error) return error;
    const posts = await sql`
      SELECT * FROM dog_posts WHERE user_id = ${session.userId} ORDER BY created_at DESC
    `;
    return Response.json(posts);
  }

  const posts = await sql`
    SELECT * FROM dog_posts
    WHERE status = 'available'
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return Response.json(posts);
}

export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const {
    name, breed, sex, ageApprox, weight, color,
    temperament, description, location, contactEmail,
    contactPhone, photos, origin,
  } = body;

  if (!name || !sex || !contactEmail) {
    return Response.json({ error: 'name, sex, and contactEmail are required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO dog_posts (
      user_id, name, breed, sex, age_months, weight, color,
      temperament, description, location, contact_email, contact_phone, photos, origin
    ) VALUES (
      ${session.userId}, ${name}, ${breed ?? null}, ${sex},
      ${ageApprox ?? null}, ${weight ?? null}, ${color ?? null},
      ${JSON.stringify(temperament ?? {})}, ${description ?? null},
      ${location ?? null}, ${contactEmail}, ${contactPhone ?? null},
      ${JSON.stringify(photos ?? [])}, ${origin ?? null}
    )
    RETURNING *
  `;

  const dog = rows[0];

  // Generate photo descriptions in the background (don't block response)
  if (photos?.length > 0 && process.env.GROQ_API_KEY) {
    describeDogPhotos(photos).then(descriptions => {
      if (descriptions.length > 0) {
        sql`UPDATE dog_posts SET photo_descriptions = ${JSON.stringify(descriptions)} WHERE id = ${dog.id}`
          .catch(err => console.error('[dog-posts] Failed to save photo descriptions:', err.message));
      }
    }).catch(err => console.error('[dog-posts] Failed to describe photos:', err.message));
  }

  return Response.json(dog, { status: 201 });
}
