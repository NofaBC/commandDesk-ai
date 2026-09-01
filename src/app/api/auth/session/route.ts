import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

// 5-day session. Firebase session cookies support up to 14 days.
const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_SEC = SESSION_DURATION_MS / 1000;

/**
 * POST /api/auth/session
 *
 * Accepts a Firebase ID token from the client after sign-in,
 * verifies it, creates a server-side session cookie, and sets it
 * as an HTTP-only, Secure, SameSite=Strict cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken: string | undefined = body?.idToken;

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify the ID token before creating a session cookie
    await adminAuth().verifyIdToken(idToken);

    // Create a Firebase session cookie
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: SESSION_DURATION_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/session] Session creation failed:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Invalid or expired credentials.' },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 *
 * Clears the session cookie to log the user out.
 * Optionally revokes the Firebase refresh tokens for the user.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (sessionCookie) {
      // Optionally revoke all Firebase sessions for this user
      try {
        const decoded = await adminAuth().verifySessionCookie(sessionCookie);
        await adminAuth().revokeRefreshTokens(decoded.uid);
      } catch {
        // Cookie may already be invalid — still clear it
      }
    }

    cookieStore.delete('__session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/session] Logout failed:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
