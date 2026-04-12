import { NextResponse } from 'next/server';
import { getSessionForResponse } from '@/lib/auth/session';

export async function POST(request) {
  const response = NextResponse.json({ ok: true });
  const session = await getSessionForResponse(request, response);
  session.destroy();
  return response;
}
