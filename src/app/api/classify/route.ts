import { NextRequest, NextResponse } from 'next/server';
import { classifyEmail } from '@/lib/ai/classifier';
import { verifySession } from '@/lib/firebase/session';

/**
 * POST /api/classify
 *
 * Standalone classification endpoint.
 * Accepts an email and returns the AI classification without routing.
 */
export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, bodyText, from } = body;

    if (!subject || !bodyText || !from) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, bodyText, from' },
        { status: 400 }
      );
    }

    const classification = await classifyEmail(subject, bodyText, from);

    return NextResponse.json({ classification });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'Classification failed' },
      { status: 500 }
    );
  }
}
