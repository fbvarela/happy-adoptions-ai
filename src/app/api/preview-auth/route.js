import { NextResponse } from 'next/server';

const PREVIEW_PASSWORD = process.env.PREVIEW_PASSWORD;

export async function POST(request) {
  const { password, next } = await request.json();

  if (!PREVIEW_PASSWORD || password !== PREVIEW_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('preview_auth', PREVIEW_PASSWORD, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
