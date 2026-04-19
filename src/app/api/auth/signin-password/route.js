import { sql } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { getSession } from '@/lib/auth/session';

export async function POST(request) {
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN !== 'true') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }

  const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email} LIMIT 1`;
  const user = rows[0];
  const ok = await verifyPassword(password, user?.password_hash);
  if (!user || !ok) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  await session.save();

  return Response.json({ ok: true });
}
