import { sql } from '@/lib/db';

export async function GET(request, { params }) {
  const { sessionId } = await params;

  if (!sessionId || sessionId === 'undefined') {
    return Response.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  const rows = await sql`
    SELECT * FROM match_sessions WHERE id = ${sessionId}
  `;

  if (rows.length === 0) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  return Response.json(rows[0]);
}
