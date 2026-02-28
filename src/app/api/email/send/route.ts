import { NextRequest, NextResponse } from 'next/server';
import { sendReplyEmail } from '@/lib/email/sender';

/**
 * POST /api/email/send
 *
 * Manually send a reply email. Used by the dashboard for manual responses.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, message, replyToMessageId } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    const result = await sendReplyEmail({
      to,
      subject,
      body: message,
      replyToMessageId,
    });

    if (result.success) {
      return NextResponse.json({ message: 'Email sent successfully' });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to send email' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
