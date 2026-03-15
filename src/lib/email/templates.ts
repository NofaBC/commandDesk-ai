/**
 * Email templates for CommandDesk AI responses.
 */

/**
 * Response for non-subscribers who email the support inbox.
 * Redirects them to the website.
 */
export function getNonSubscriberResponse(senderName?: string): string {
  const greeting = senderName ? `Hello ${senderName}` : 'Hello';

  return `${greeting},

Thank you for reaching out to NOFA Business Consulting.

Our technical support inbox is reserved for active subscribers of our AI products. If you are a subscriber, please ensure you are emailing from the same address associated with your account.

For general inquiries, please visit our website:
https://nofabusinessconsulting.com

Interested in our AI-powered products?
• CareerPilot AI - AI Resume Builder
• AffiliateLedger AI - Affiliate Management
• And more...

Learn more at: https://nofabusinessconsulting.com/products

If you believe you should have access to support, please contact us through our website.

Best regards,
NOFA Business Consulting Team`;
}

/**
 * Response for subscribers with expired/cancelled subscriptions.
 */
export function getExpiredSubscriberResponse(senderName?: string): string {
  const greeting = senderName ? `Hello ${senderName}` : 'Hello';

  return `${greeting},

Thank you for contacting NOFA Support.

It appears that your subscription has expired or been cancelled. To continue receiving technical support for our AI products, please renew your subscription.

Renew your subscription:
https://nofabusinessconsulting.com/account

If you believe this is an error, please contact us at:
https://nofabusinessconsulting.com/contact

We'd love to have you back!

Best regards,
NOFA Business Consulting Team`;
}

/**
 * Acknowledgment email for technical issues being escalated to TechSupport AI.
 */
export function getTechEscalationAcknowledgment(
  ticketNumber: string,
  senderName?: string
): string {
  const greeting = senderName ? `Hello ${senderName}` : 'Hello';

  return `${greeting},

Thank you for reaching out to NOFA AI Support.

We've received your technical inquiry and our specialized technical support team is now reviewing it. Your case reference number is ${ticketNumber}.

You can expect a detailed response shortly. If your issue is urgent, please reply to this email with additional details.

Best regards,
NOFA AI Support Team`;
}

/**
 * Standard support acknowledgment.
 */
export function getSupportAcknowledgment(senderName?: string): string {
  const greeting = senderName ? `Hello ${senderName}` : 'Hello';

  return `${greeting},

Thank you for contacting NOFA AI Support.

We've received your message and will respond as soon as possible.

Best regards,
NOFA AI Support Team`;
}
