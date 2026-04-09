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
