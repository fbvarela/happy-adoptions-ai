import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request, { params }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM dog_posts WHERE id = ${id}`;
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(rows[0]);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error) return error;

  const rows = await sql`SELECT user_id FROM dog_posts WHERE id = ${id}`;
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
  if (rows[0].user_id !== session.userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updated = await sql`
    UPDATE dog_posts SET
      name = COALESCE(${body.name ?? null}, name),
      breed = COALESCE(${body.breed ?? null}, breed),
      description = COALESCE(${body.description ?? null}, description),
      status = COALESCE(${body.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  return Response.json(updated[0]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { session, error } = await requireAuth();
  if (error) return error;

  const rows = await sql`SELECT user_id FROM dog_posts WHERE id = ${id}`;
  if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
  if (rows[0].user_id !== session.userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  await sql`DELETE FROM dog_posts WHERE id = ${id}`;
  return Response.json({ ok: true });
}
