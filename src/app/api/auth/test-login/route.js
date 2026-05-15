import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSessionForResponse } from '@/lib/auth/session';
import { getEnv } from '@/lib/env';

export async function POST(request) {
  try {
    const testEmail1 = getEnv('TEST_LOGIN_EMAIL');
    const testPassword1 = getEnv('TEST_LOGIN_PASSWORD');
    const testEmail2 = getEnv('TEST_LOGIN_EMAIL_2');
    const testPassword2 = getEnv('TEST_LOGIN_PASSWORD_2');

    const { email, password } = await request.json();

    let authenticatedEmail = null;

    if (testEmail1 && testPassword1 && email === testEmail1 && password === testPassword1) {
      authenticatedEmail = testEmail1;
    } else if (testEmail2 && testPassword2 && email === testEmail2 && password === testPassword2) {
      authenticatedEmail = testEmail2;
    }

    if (!authenticatedEmail) {
      return NextResponse.json({ error: 'Invalid credentials or test login not configured' }, { status: 401 });
    }

    // Find or create user
    const users = await sql`
      INSERT INTO users (email)
      VALUES (${authenticatedEmail})
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, email
    `;
    const user = users[0];

    const response = NextResponse.json({ ok: true });
    const session = await getSessionForResponse(request, response);
    session.userId = user.id;
    session.email = user.email;
    await session.save();

    return response;
  } catch (err) {
    console.error('[auth/test-login]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
