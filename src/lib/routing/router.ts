import type {
  EmailClassification,
  RoutingOutcome,
  Interaction,
} from '@/types';
import { classifyEmail } from '@/lib/ai/classifier';
import { generateAutoReply } from '@/lib/ai/responder';
import { sendReplyEmail } from '@/lib/email/sender';
import { forwardToTechSupport } from '@/lib/routing/techsupport';
import { sendSlackNotification } from '@/lib/notifications/slack';
import {
  createInteraction,
  updateInteractionClassification,
  updateInteractionRouting,
  updateInteractionStatus,
} from '@/lib/firebase/interactions';
import { verifySubscriber } from '@/lib/auth/subscriber';
import { getNonSubscriberResponse, getExpiredSubscriberResponse } from '@/lib/email/templates';
import type { ParsedEmail } from '@/lib/email/gmail';

export interface ProcessResult {
  interactionId: string;
  classification: EmailClassification;
  routingOutcome: RoutingOutcome;
  responseSent: boolean;
  techSupportCaseId?: string;
  error?: string;
  subscriberStatus?: 'active' | 'trial' | 'not_found' | 'cancelled' | 'expired';
}

/**
 * Process a single email through the full pipeline:
 * 0. Verify subscriber status (authorization gate)
 * 1. Log the interaction
 * 2. Classify with AI
 * 3. Route based on classification
 * 4. Send response or escalate
 * 5. Notify Slack
 * 6. Update interaction record
 */
export async function processEmail(email: ParsedEmail): Promise<ProcessResult> {
  let interactionId = '';

  try {
    // Step 0: Verify subscriber status (AUTHORIZATION GATE)
    const subscriberResult = await verifySubscriber(email.from);
    
    if (!subscriberResult.isSubscriber) {
      // Non-subscriber - send redirect email and skip full pipeline
      console.log(`Non-subscriber email from ${email.from}: ${subscriberResult.reason}`);
      
      // Determine response based on reason
      let responseBody: string;
      if (subscriberResult.reason === 'cancelled' || subscriberResult.reason === 'expired') {
        responseBody = getExpiredSubscriberResponse(email.fromName);
      } else {
        responseBody = getNonSubscriberResponse(email.fromName);
      }
      
      // Send non-subscriber response
      await sendReplyEmail({
        to: email.from,
        subject: email.subject,
        body: responseBody,
        replyToMessageId: email.id,
      });
      
      // Return early - skip full pipeline
      return {
        interactionId: '',
        classification: {
          product: 'unknown',
          intent: 'general',
          severity: 'low',
          summary: 'Non-subscriber inquiry redirected to website',
          confidence: 1,
          language: 'en',
        },
        routingOutcome: 'auto_replied',
        responseSent: true,
        subscriberStatus: subscriberResult.reason,
      };
    }
    
    // SUBSCRIBER VERIFIED - Continue with full pipeline
    console.log(`Subscriber verified: ${email.from} (${subscriberResult.reason})`);

    // Step 1: Create interaction record
    interactionId = await createInteraction({
      emailId: email.id,
      threadId: email.threadId,
      from: email.from,
      fromName: email.fromName,
      to: email.to,
      subject: email.subject,
      body: email.body,
      routingOutcome: 'pending',
      status: 'received',
      slackNotified: false,
      receivedAt: email.receivedAt,
    });

    // Step 2: Classify email
    await updateInteractionStatus(interactionId, 'classifying');
    const classification = await classifyEmail(
      email.subject,
      email.body,
      email.from
    );
    await updateInteractionClassification(interactionId, classification);

    // Step 3: Route based on classification
    const result = await routeEmail(
      interactionId,
      email,
      classification
    );

    // Step 4: Notify Slack
    try {
      await sendSlackNotification({
        interactionId,
        from: email.from,
        subject: email.subject,
        product: classification.product,
        intent: classification.intent,
        severity: classification.severity,
        summary: classification.summary,
        routingOutcome: result.routingOutcome,
        responseSent: result.responseSent,
        needsHumanAttention:
          classification.severity === 'critical' ||
          result.routingOutcome === 'pending_human',
      });

      await updateInteractionStatus(interactionId, result.responseSent ? 'responded' : 'escalated', {
        slackNotified: true,
      } as Partial<Interaction>);
    } catch (slackError) {
      console.error('Slack notification failed:', slackError);
      // Don't fail the whole process for a Slack error
    }

    return {
      interactionId,
      classification,
      ...result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown processing error';
    console.error(`Error processing email ${email.id}:`, errorMessage);

    if (interactionId) {
      await updateInteractionStatus(interactionId, 'failed', {
        errorMessage,
      } as Partial<Interaction>);
    }

    return {
      interactionId,
      classification: {
        product: 'unknown',
        intent: 'general',
        severity: 'medium',
        summary: 'Classification failed',
        confidence: 0,
        language: 'en',
      },
      routingOutcome: 'pending',
      responseSent: false,
      error: errorMessage,
    };
  }
}

/**
 * Route email based on classification:
 * - Technical issues → TechSupport-AI
 * - Everything else → Auto-reply
 * - Critical severity → Always flag for human review
 */
async function routeEmail(
  interactionId: string,
  email: ParsedEmail,
  classification: EmailClassification
): Promise<{
  routingOutcome: RoutingOutcome;
  responseSent: boolean;
  techSupportCaseId?: string;
}> {
  // Technical issues → forward to TechSupport-AI
  if (classification.intent === 'technical') {
    return await handleTechnicalEscalation(
      interactionId,
      email,
      classification
    );
  }

  // Critical severity (non-technical) → auto-reply but flag for human
  if (classification.severity === 'critical') {
    const responseSent = await handleAutoReply(
      interactionId,
      email,
      classification
    );

    await updateInteractionRouting(interactionId, 'pending_human', {
      status: 'responded',
      respondedAt: new Date(),
    } as Partial<Interaction>);

    return {
      routingOutcome: 'pending_human',
      responseSent,
    };
  }

  // Standard auto-reply flow
  const responseSent = await handleAutoReply(
    interactionId,
    email,
    classification
  );

  await updateInteractionRouting(interactionId, 'auto_replied', {
    status: 'responded',
    respondedAt: new Date(),
  } as Partial<Interaction>);

  return {
    routingOutcome: 'auto_replied',
    responseSent,
  };
}

async function handleTechnicalEscalation(
  interactionId: string,
  email: ParsedEmail,
  classification: EmailClassification
): Promise<{
  routingOutcome: RoutingOutcome;
  responseSent: boolean;
  techSupportCaseId?: string;
}> {
  try {
    const caseResult = await forwardToTechSupport({
      product: classification.product,
      category: 'technical',
      severity: classification.severity,
      language: classification.language,
      customerContact: {
        phone: '',
        email: email.from,
        name: email.fromName,
      },
      problem: `${email.subject}\n\n${email.body}`,
    });

    await updateInteractionRouting(interactionId, 'escalated_techsupport', {
      techSupportCaseId: caseResult.id,
      techSupportTicketNumber: caseResult.ticketNumber,
      status: 'escalated',
    } as Partial<Interaction>);

    // Send acknowledgment to customer
    await sendReplyEmail({
      to: email.from,
      subject: email.subject,
      body: `Thank you for reaching out to NOFA AI Support.

We've received your technical inquiry and our specialized technical support team is now reviewing it. Your case reference number is ${caseResult.ticketNumber}.

You can expect a detailed response shortly. If your issue is urgent, please reply to this email with additional details.

Best regards,
NOFA AI Support Team`,
      replyToMessageId: email.id,
    });

    return {
      routingOutcome: 'escalated_techsupport',
      responseSent: true,
      techSupportCaseId: caseResult.id,
    };
  } catch (error) {
    console.error('TechSupport escalation failed:', error);

    // Fallback: send a generic response
    await sendReplyEmail({
      to: email.from,
      subject: email.subject,
      body: `Thank you for contacting NOFA AI Support.

We've received your technical inquiry and our team is reviewing it. We'll get back to you with a detailed response as soon as possible.

Best regards,
NOFA AI Support Team`,
      replyToMessageId: email.id,
    });

    await updateInteractionRouting(interactionId, 'pending_human', {
      status: 'responded',
      respondedAt: new Date(),
      errorMessage: `TechSupport escalation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    } as Partial<Interaction>);

    return {
      routingOutcome: 'pending_human',
      responseSent: true,
    };
  }
}

async function handleAutoReply(
  interactionId: string,
  email: ParsedEmail,
  classification: EmailClassification
): Promise<boolean> {
  try {
    const replyBody = await generateAutoReply(
      email.subject,
      email.body,
      email.from,
      classification
    );

    const result = await sendReplyEmail({
      to: email.from,
      subject: email.subject,
      body: replyBody,
      replyToMessageId: email.id,
    });

    if (result.success) {
      await updateInteractionStatus(interactionId, 'responded', {
        response: replyBody,
        respondedAt: new Date(),
      } as Partial<Interaction>);
      return true;
    }

    console.error('Failed to send auto-reply:', result.error);
    return false;
  } catch (error) {
    console.error('Auto-reply error:', error);
    return false;
  }
}
