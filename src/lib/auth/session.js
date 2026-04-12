import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { getEnv } from '@/lib/env';

export function getSessionOptions() {
  return {
    password: getEnv('SESSION_SECRET'),
    cookieName: 'adoptions_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, getSessionOptions());
}

// Use when the handler returns a response it constructed itself (NextResponse.json,
// NextResponse.redirect, etc.). Mutations via next/headers cookies() do not attach
// Set-Cookie to a response you return manually, so bind the session to (req, res) instead.
export function getSessionForResponse(request, response) {
  return getIronSession(request, response, getSessionOptions());
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.userId) {
    return {
      session: null,
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, error: null };
}
