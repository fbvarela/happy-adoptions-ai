import { NextResponse } from 'next/server';

const PREVIEW_PASSWORD = process.env.PREVIEW_PASSWORD;
const COOKIE_NAME = 'preview_auth';
const AUTH_PATH = '/preview-auth';

export function middleware(request) {
  if (!PREVIEW_PASSWORD) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === AUTH_PATH || pathname.startsWith('/api/preview-auth')) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === PREVIEW_PASSWORD) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = AUTH_PATH;
  url.searchParams.set('next', pathname === '/' ? '' : pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons|manifest).*)'],
};
