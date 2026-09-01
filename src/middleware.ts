import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware — Route Protection
 *
 * Protects /dashboard/* and /debug/* by verifying the presence of the
 * __session cookie set by /api/auth/session after Firebase login.
 *
 * The cookie presence check here is the first gate (UX layer).
 * Full cryptographic verification happens in the dashboard layout server
 * component via adminAuth().verifySessionCookie(), which is the actual
 * security enforcement layer.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already heading to login — let it through
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('__session')?.value;

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect dashboard pages and debug tools
  matcher: ['/dashboard/:path*', '/debug/:path*'],
};
