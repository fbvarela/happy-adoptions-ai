import { generateMagicLink, sendMagicLinkEmail } from '@/lib/auth/magic-link';

export async function POST(request) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

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
