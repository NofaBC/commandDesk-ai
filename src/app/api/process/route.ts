import { NextRequest, NextResponse } from 'next/server';
import { processEmail } from '@/lib/routing/router';
import type { ParsedEmail } from '@/lib/email/gmail';

/**
 * POST /api/process
 *
 * Master orchestrator endpoint.
 * Accepts a parsed email and runs the full pipeline:
 * classify → route → respond → log → notify
 *
 * Useful for testing or manual processing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, threadId, from, fromName, to, subject, emailBody, receivedAt } =
      body;

    if (!id || !from || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: id, from, subject, emailBody' },
        { status: 400 }
      );
    }

    const email: ParsedEmail = {
      id,
      threadId: threadId || id,
      from,
      fromName,
      to: to || process.env.GMAIL_USER_EMAIL || '',
      subject,
      body: emailBody,
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
    };

    const result = await processEmail(email);

    return NextResponse.json(result, {
      status: result.error ? 207 : 200,
    });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
