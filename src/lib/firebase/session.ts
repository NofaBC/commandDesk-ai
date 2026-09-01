import { cookies } from 'next/headers';
import { adminAuth } from './admin';

/**
 * Verifies the Firebase session cookie from the incoming request.
 *
 * Uses adminAuth().verifySessionCookie() with checkRevoked=true, which
 * validates the cookie cryptographically AND checks Firebase's server-side
 * revocation list. This is the authoritative security enforcement layer.
 *
 * Returns the decoded token claims on success, or null if the session is
 * missing, expired, or revoked.
 */
export async function verifySession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) return null;

    const decodedClaims = await adminAuth().verifySessionCookie(
      sessionCookie,
      true // checkRevoked — ensures logged-out sessions are rejected
    );

    return decodedClaims;
  } catch {
    // Invalid, expired, or revoked cookie
    return null;
  }
}

/**
 * Returns the session cookie string from the incoming request, or null.
 * Used by API route handlers that want to perform their own verification.
 */
export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('__session')?.value ?? null;
}
