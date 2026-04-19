import { sql } from '@/lib/db';
import { createPasswordResetToken, consumePasswordResetToken } from '@/lib/auth/reset';
import { hashPassword } from '@/lib/auth/password';
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

  // Flow 2: consume token + set new password
  if (typeof body.token === 'string' && typeof body.password === 'string') {
    if (body.password.length < 6 || body.password.length > 128) {
      return Response.json({ error: 'Password must be 6–128 characters' }, { status: 400 });
    }

    const result = await consumePasswordResetToken(body.token);
    if (!result) {
      return Response.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);
    const existing = await sql`SELECT id FROM users WHERE email = ${result.email} LIMIT 1`;
    let userRow;
    if (existing.length > 0) {
      const updated = await sql`
        UPDATE users SET password_hash = ${passwordHash} WHERE id = ${existing[0].id}
        RETURNING id, email
      `;
      userRow = updated[0];
    } else {
      const inserted = await sql`
        INSERT INTO users (email, password_hash) VALUES (${result.email}, ${passwordHash})
        RETURNING id, email
      `;
      userRow = inserted[0];
    }

    const session = await getSession();
    session.userId = userRow.id;
    session.email = userRow.email;
    await session.save();

    return Response.json({ ok: true });
  }

  // Flow 1: send reset email
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const result = await createPasswordResetToken(email);
  if ('error' in result) {
    return Response.json({ sent: true });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${result.token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@happyfactory.app',
          to: email,
          subject: 'Reset your Happy Adoptions password',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2>Reset your password</h2>
              <p>Click the link below to choose a new password. This link expires in 30 minutes.</p>
              <p><a href="${resetUrl}" style="display:inline-block;background:#3d6020;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">Reset password</a></p>
              <p style="color:#6b7280;font-size:14px">If you didn't request this, you can safely ignore it.</p>
            </div>
          `,
        }),
      });
    } catch (err) {
      console.error('reset-password email error:', err);
    }
  } else {
    console.log(`\n🔐 PASSWORD RESET (dev)\n  To: ${email}\n  ${resetUrl}\n`);
  }

  return Response.json({ sent: true });
}
