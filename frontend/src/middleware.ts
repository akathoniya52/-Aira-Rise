import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require an authenticated session.
const PUBLIC_PATHS = ['/login', '/register', '/health'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('airarise_session');

  // Allow public auth pages and static assets through.
  if (PUBLIC_PATHS.includes(pathname)) {
    // If already authenticated, visiting /login redirects to the dashboard.
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Gate every other route behind a session cookie.
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals, the API layer, and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
};
