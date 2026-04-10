import { sql } from '@/lib/db';
import { createHash, randomBytes } from 'crypto';
import { getEnv } from '@/lib/env';

const TOKEN_EXPIRY_MINUTES = 60;
const RATE_LIMIT_PER_HOUR = 5;

export async function generateMagicLink(email, origin) {
  // Rate limit: max 5 links per email per hour
  const recent = await sql`
    SELECT COUNT(*) as count FROM magic_links
    WHERE email = ${email}
      AND created_at > NOW() - INTERVAL '1 hour'
      AND used = false
  `;
  if (parseInt(recent[0].count) >= RATE_LIMIT_PER_HOUR) {
    throw new Error('Too many magic links requested. Try again later.');
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await sql`
    INSERT INTO magic_links (email, token_hash, expires_at)
    VALUES (${email}, ${tokenHash}, ${expiresAt})
  `;

  return `${origin}/api/auth/callback?token=${token}&email=${encodeURIComponent(email)}`;
}

export async function verifyMagicLink(token, email) {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const rows = await sql`
    SELECT * FROM magic_links
    WHERE token_hash = ${tokenHash}
      AND email = ${email}
      AND used = false
      AND expires_at > NOW()
    LIMIT 1
  `;

  if (rows.length === 0) {
    return { valid: false };
  }

  await sql`UPDATE magic_links SET used = true WHERE token_hash = ${tokenHash}`;

  // Upsert user
  const users = await sql`
    INSERT INTO users (email)
    VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, email
  `;

  return { valid: true, user: users[0] };
}

const EMAIL_STRINGS = {
  en: {
    subject: 'Your Happy Adoptions sign-in link',
    heading: '🐾 Happy Adoptions AI',
    body: 'Click the button below to sign in. This link expires in 1 hour.',
    button: 'Sign in to Happy Adoptions',
    copyLink: 'Or copy this link:',
    ignore: 'If you did not request this, you can safely ignore this email.',
  },
  'es-ES': {
    subject: 'Tu enlace de acceso a Happy Adoptions',
    heading: '🐾 Happy Adoptions AI',
    body: 'Haz clic en el boton de abajo para iniciar sesion. Este enlace caduca en 1 hora.',
    button: 'Iniciar sesion en Happy Adoptions',
    copyLink: 'O copia este enlace:',
    ignore: 'Si no has solicitado esto, puedes ignorar este email.',
  },
};

export async function sendMagicLinkEmail(to, magicLink, locale = 'en') {
  const strings = EMAIL_STRINGS[locale] || EMAIL_STRINGS.en;
  if (!getEnv('RESEND_API_KEY')) {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║  🐾 MAGIC LINK (dev mode)                ║');
    console.log(`║  To: ${to}`);
    console.log(`║  ${magicLink}`);
    console.log('╚══════════════════════════════════════════╝\n');
    return;
  }

  const from = getEnv('EMAIL_FROM') ?? 'noreply@happyfactory.app';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getEnv('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: strings.subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#3d2b1f">${strings.heading}</h2>
          <p>${strings.body}</p>
          <a href="${magicLink}"
             style="display:inline-block;background:#4a7c59;color:#fff;text-decoration:none;
                    padding:12px 24px;border-radius:6px;font-weight:600;margin:16px 0">
            ${strings.button}
          </a>
          <p style="color:#6b7280;font-size:14px">
            ${strings.copyLink}<br/>
            <a href="${magicLink}" style="color:#4a7c59;word-break:break-all">${magicLink}</a>
          </p>
          <p style="color:#9ca3af;font-size:12px">
            ${strings.ignore}
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error: ${res.status} — ${body}`);
  }
}
