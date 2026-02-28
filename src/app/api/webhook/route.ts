import { NextRequest, NextResponse } from 'next/server';
import { sendReplyEmail } from '@/lib/email/sender';
import { adminDb } from '@/lib/firebase/admin';
import type { TechSupportWebhookPayload } from '@/types';

/**
 * POST /api/webhook
 *
 * Receives resolution callbacks from TechSupport-AI.
 * When TechSupport resolves a case, it calls this webhook
 * so CommandDesk can send the resolution to the customer.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: TechSupportWebhookPayload = await request.json();

    if (!payload.caseId || !payload.ticketNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId, ticketNumber' },
        { status: 400 }
      );
    }

    // Find the interaction linked to this TechSupport case
    const db = adminDb();
    const snapshot = await db
      .collection('interactions')
      .where('techSupportCaseId', '==', payload.caseId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: `No interaction found for case ${payload.caseId}` },
        { status: 404 }
      );
    }

    const interactionDoc = snapshot.docs[0];
    const interaction = interactionDoc.data();

    // Send the resolution to the customer
    if (payload.responseToCustomer && interaction.from) {
      const emailResult = await sendReplyEmail({
        to: interaction.from,
        subject: interaction.subject || `Case ${payload.ticketNumber} Update`,
        body: payload.responseToCustomer,
        replyToMessageId: interaction.emailId,
      });

      // Update the interaction record
      await interactionDoc.ref.update({
        status: payload.status === 'resolved' ? 'resolved' : 'responded',
        response: payload.responseToCustomer,
        respondedAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        message: 'Webhook processed',
        emailSent: emailResult.success,
        interactionId: interactionDoc.id,
      });
    }

    // No customer response needed, just update status
    await interactionDoc.ref.update({
      status: payload.status === 'resolved' ? 'resolved' : interaction.status,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Webhook processed (no customer response)',
      interactionId: interactionDoc.id,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
