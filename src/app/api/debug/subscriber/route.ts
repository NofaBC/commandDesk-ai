import { NextResponse } from 'next/server';
import { findSubscriberByEmail } from '@/lib/firebase/subscribers';
import { verifySubscriber } from '@/lib/auth/subscriber';
import { verifySession } from '@/lib/firebase/session';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to test subscriber lookup
 * GET /api/debug/subscriber?email=fnasserg@gmail.com
 */
export async function GET(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
  }

  try {
    // Test raw lookup
    const subscriber = await findSubscriberByEmail(email);
    
    // Test verification
    const verification = await verifySubscriber(email);

    return NextResponse.json({
      success: true,
      email,
      normalizedEmail: email.toLowerCase().trim(),
      subscriber,
      verification,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug subscriber lookup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
