import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { getSession } from '@/lib/auth/session';

function isValidEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPassword(v) {
  return typeof v === 'string' && v.length >= 6 && v.length <= 128;
}

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

  if (!isValidEmail(body.email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!isValidPassword(body.password)) {
    return Response.json({ error: 'Password must be 6–128 characters' }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();
  const passwordHash = await hashPassword(body.password);

  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  let userRow;
  let action;
  if (existing.length > 0) {
    const updated = await sql`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${existing[0].id}
      RETURNING id, email
    `;
    userRow = updated[0];
    action = 'updated';
  } else {
    const inserted = await sql`
      INSERT INTO users (email, password_hash) VALUES (${email}, ${passwordHash})
      RETURNING id, email
    `;
    userRow = inserted[0];
    action = 'created';
  }

  const session = await getSession();
  session.userId = userRow.id;
  session.email = userRow.email;
  await session.save();

  return Response.json({ ok: true, action, userId: userRow.id });
}
