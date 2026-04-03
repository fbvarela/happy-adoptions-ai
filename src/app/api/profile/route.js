import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const rows = await sql`
    SELECT * FROM adopter_profiles WHERE user_id = ${session.userId}
  `;
  return Response.json(rows[0] ?? null);
}

export async function PUT(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const profile = await request.json();

  const rows = await sql`
    INSERT INTO adopter_profiles (user_id, profile_data, updated_at)
    VALUES (${session.userId}, ${JSON.stringify(profile)}, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET profile_data = EXCLUDED.profile_data, updated_at = NOW()
    RETURNING *
  `;

  return Response.json(rows[0]);
}
