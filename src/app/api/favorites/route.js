import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const favorites = await sql`
    SELECT f.*, dp.name, dp.breed, dp.sex, dp.age_months, dp.photos, dp.status
    FROM favorites f
    LEFT JOIN dog_posts dp ON f.dog_post_id = dp.id
    WHERE f.user_id = ${session.userId}
    ORDER BY f.created_at DESC
  `;

  return Response.json(favorites);
}

export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { dogPostId, shelterDogId, shelterId } = await request.json();

  if (!dogPostId && !shelterDogId) {
    return Response.json({ error: 'dogPostId or shelterDogId required' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO favorites (user_id, dog_post_id, shelter_dog_id, shelter_id)
    VALUES (${session.userId}, ${dogPostId ?? null}, ${shelterDogId ?? null}, ${shelterId ?? null})
    ON CONFLICT (user_id, dog_post_id) DO NOTHING
    RETURNING *
  `;

  return Response.json(rows[0] ?? { ok: true }, { status: 201 });
}

export async function DELETE(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { dogPostId, shelterDogId } = await request.json();

  await sql`
    DELETE FROM favorites
    WHERE user_id = ${session.userId}
      AND (
        (dog_post_id = ${dogPostId ?? null} AND ${dogPostId ?? null} IS NOT NULL)
        OR
        (shelter_dog_id = ${shelterDogId ?? null} AND ${shelterDogId ?? null} IS NOT NULL)
      )
  `;

  return Response.json({ ok: true });
}
