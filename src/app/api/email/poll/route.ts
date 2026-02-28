import { NextResponse } from 'next/server';
import { fetchUnreadEmails, markAsRead } from '@/lib/email/gmail';
import { processEmail } from '@/lib/routing/router';
import type { PollResult } from '@/types';

/**
 * GET /api/email/poll
 *
 * Cron endpoint that polls Gmail for unread emails,
 * processes each one through the classification → routing pipeline,
 * and marks them as read.
 *
 * Triggered by Vercel Cron every 2 minutes.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch unread emails
    const emails = await fetchUnreadEmails(10);

    const result: PollResult = {
      emailsFound: emails.length,
      emailsProcessed: 0,
      errors: [],
    };

    if (emails.length === 0) {
      return NextResponse.json({
        message: 'No new emails',
        ...result,
      });
    }

    // Process each email
    for (const email of emails) {
      try {
        await processEmail(email);
        await markAsRead(email.id);
        result.emailsProcessed++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Email ${email.id}: ${msg}`);
        console.error(`Failed to process email ${email.id}:`, msg);
      }
    }

    return NextResponse.json({
      message: `Processed ${result.emailsProcessed} of ${result.emailsFound} emails`,
      ...result,
    });
  } catch (error) {
    console.error('Email poll error:', error);
    return NextResponse.json(
      { error: 'Failed to poll emails' },
      { status: 500 }
    );
  }
}
