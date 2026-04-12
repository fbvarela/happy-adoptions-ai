import { NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth/magic-link';
import { getSessionForResponse } from '@/lib/auth/session';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  try {
    const { valid, user } = await verifyMagicLink(token, email);

    if (!valid || !user) {
      return NextResponse.redirect(`${origin}/login?error=expired_link`);
    }

    const response = NextResponse.redirect(`${origin}/dashboard`);
    const session = await getSessionForResponse(request, response);
    session.userId = user.id;
    session.email = user.email;
    await session.save();

    return response;
  } catch (err) {
    console.error('[auth/callback]', err.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }
}
