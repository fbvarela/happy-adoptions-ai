import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/',
  '/_next/',
  '/icons/',
  '/manifest.json',
  '/favicon.ico',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('adoptions_session');
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons|manifest).*)'],
};
