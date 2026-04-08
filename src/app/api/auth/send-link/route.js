import { generateMagicLink, sendMagicLinkEmail } from '@/lib/auth/magic-link';
import { getSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function POST(request) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // In dev mode without Resend, skip magic link and create session directly
  if (process.env.NODE_ENV !== 'production' && !process.env.RESEND_API_KEY) {
    try {
      const users = await sql`
        INSERT INTO users (email)
        VALUES (${normalizedEmail})
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id, email
      `;
      const user = users[0];
      const session = await getSession();
      session.userId = user.id;
      session.email = user.email;
      await session.save();
      return Response.json({ sent: true, devRedirect: '/dashboard' });
    } catch (err) {
      console.error('[auth/send-link] dev bypass error:', err.message);
      return Response.json({ error: 'Auth bypass failed' }, { status: 500 });
    }
  }

  const requestOrigin = new URL(request.url).origin;
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const origin = configured?.startsWith('https://') ? configured.replace(/\/$/, '') : requestOrigin;

  try {
    const magicLink = await generateMagicLink(normalizedEmail, origin);
    await sendMagicLinkEmail(normalizedEmail, magicLink);
    return Response.json({ message: 'Magic link sent — check your email.' });
  } catch (err) {
    console.error('[auth/send-link]', err.message);
    if (err.message.includes('Too many')) {
      return Response.json({ error: err.message }, { status: 429 });
    }
    return Response.json({ error: 'Failed to send magic link' }, { status: 503 });
  }
}
