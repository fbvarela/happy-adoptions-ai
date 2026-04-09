import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { getEnv } from '@/lib/env';

export async function POST(request) {
  try {
    const testEmail = getEnv('TEST_LOGIN_EMAIL');
    const testPassword = getEnv('TEST_LOGIN_PASSWORD');

    if (!testEmail || !testPassword) {
      return NextResponse.json({ error: 'Test login not configured' }, { status: 404 });
    }

    const { email, password } = await request.json();

    if (email !== testEmail || password !== testPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Find or create user
    const users = await sql`
      INSERT INTO users (email)
      VALUES (${testEmail})
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, email
    `;
    const user = users[0];

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/test-login]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
