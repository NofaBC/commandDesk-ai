import OpenAI from 'openai';
import type { EmailClassification } from '@/types';
import { queryKnowledgeBase, formatContextForPrompt } from '@/lib/knowledge-base/retrieval';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Get product-specific URL for directing customers
 */
function getProductUrl(productSlug: string): string {
  const productUrls: Record<string, string> = {
    'careerpilot-ai': 'https://nofabusinessconsulting.com/careerpilot-ai/',
    'techsupport-ai': 'https://nofabusinessconsulting.com/techsupport-ai/',
    'visionwing': 'https://nofabusinessconsulting.com/visionwing/',
    'magazinifyai': 'https://nofabusinessconsulting.com/magazinifyai/',
    'affiliateledger-ai': 'https://nofabusinessconsulting.com/affiliateledger-ai/',
    'rfpmatch-ai': 'https://nofabusinessconsulting.com/rfpmatch-ai/',
  };

  return productUrls[productSlug] || 'https://nofabusinessconsulting.com';
}

function getSystemPrompt(productSlug: string): string {
  const productUrl = getProductUrl(productSlug);
  
  return `You are CommandDesk AI, the automated support responder for NOFA AI Factory.

You write helpful, professional, and concise email replies to customers.

Company context:
- Company: NOFA AI Factory (NOFA Business Consulting LLC)
- Products: CareerPilot AI™, TechSupport AI™, VisionWing™, MagazinifyAI™, AffiliateLedger AI™, RFPMatch AI™
- Website: nofabusinessconsulting.com
- Product page: ${productUrl}
- Support email: support@nofabusinessconsulting.com

Guidelines:
- Be warm but professional
- Keep responses concise (2-4 paragraphs max)
- Address the customer's question directly
- When directing customers to learn more, use the product-specific URL: ${productUrl}
- For billing: direct to the billing dashboard or mention Stripe
- For account/login: provide general reset instructions
- For sales: highlight key features and direct to the product page
- For feature requests: thank them and confirm it's been logged
- Sign off as "NOFA AI Support Team"
- Do NOT attempt to solve technical issues — those are routed separately

IMPORTANT: You are writing the BODY of the email only. Do not include subject lines.`;
}

export async function generateAutoReply(
  subject: string,
  body: string,
  from: string,
  classification: EmailClassification
): Promise<string> {
  try {
    // Query knowledge base for relevant context
    const contexts = await queryKnowledgeBase(
      classification.product,
      subject + '\n' + body
    );

    const contextPrompt = formatContextForPrompt(contexts);

    const systemPrompt = getSystemPrompt(classification.product);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a reply to this customer email.

Classification:
- Product: ${classification.product}
- Intent: ${classification.intent}
- Severity: ${classification.severity}
- Summary: ${classification.summary}${contextPrompt}

Original email from ${from}:
Subject: ${subject}

${body}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return content.trim();
  } catch (error) {
    console.error('Auto-reply generation error:', error);

    // Return a safe fallback response
    return getFallbackResponse(classification);
  }
}

function getFallbackResponse(classification: EmailClassification): string {
  const name = classification.product !== 'unknown' 
    ? classification.product.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'our products';

  switch (classification.intent) {
    case 'billing':
      return `Thank you for reaching out about your billing inquiry regarding ${name}.

We've received your message and our team will review it shortly. In the meantime, you can manage your subscription and view invoices through your account dashboard.

If you need immediate assistance, please reply to this email with any additional details.

Best regards,
NOFA AI Support Team`;

    case 'account':
      return `Thank you for contacting us about your account.

If you're having trouble logging in, please try resetting your password using the "Forgot Password" link on the login page. If the issue persists, reply to this email and we'll assist you further.

Best regards,
NOFA AI Support Team`;

    case 'sales':
      const productUrl = getProductUrl(classification.product);
      return `Thank you for your interest in ${name}!

We'd love to help you learn more. Please visit ${productUrl} for detailed information about features and pricing. If you have specific questions, feel free to reply to this email.

Best regards,
NOFA AI Support Team`;

    case 'feature_request':
      return `Thank you for your feedback regarding ${name}!

We've logged your feature request and our product team will review it. We appreciate customers who help us improve our products.

Best regards,
NOFA AI Support Team`;

    default:
      return `Thank you for contacting NOFA AI Support.

We've received your message and will get back to you as soon as possible. If your issue is urgent, please reply with additional details.

Best regards,
NOFA AI Support Team`;
  }
}
