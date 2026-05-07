import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session';

const PROTECTED_ROUTES = ['/dashboard', '/builder', '/responses'];
const AUTH_ROUTES = ['/login'];
const COOKIE_NAME = 'khipu_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  const isAuthenticated = !!session;

  // If trying to access protected route without auth -> redirect to login
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth routes -> redirect to dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot|otf)$).*)',
  ],
};
