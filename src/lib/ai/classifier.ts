import OpenAI from 'openai';
import type { EmailClassification, IntentCategory, Severity, IssueCategory } from '@/types';
import {
  buildClassifierProductList,
  buildClassifierRules,
  detectExplicitProducts,
  resolveProduct,
} from '@/lib/products/identify';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * The product list and product-specific disambiguation rules are generated from
 * the NOFA Product Registry (src/lib/products/registry.ts). To add a product,
 * add a registry entry - do not edit this prompt.
 */
export function buildSystemPrompt(): string {
  return `You are CommandDesk AI, an email classification system for NOFA AI Factory.

You analyze incoming customer support emails and extract structured metadata.

NOFA AI Factory products (match carefully based on keywords):

${buildClassifierProductList()}

IMPORTANT: If the email mentions resume, job, career, CV, cover letter, or employment-related features, it is ALWAYS Dlyn-AI (dlyn-ai), NOT RFPMatch AI.
IMPORTANT: "CareerPilot AI" has been rebranded to "Dlyn-AI". Any mention of CareerPilot should be classified as dlyn-ai.
${buildClassifierRules()}

For each email, determine:
1. **product**: Which NOFA product is referenced (use the slug from above, or "unknown")
2. **intent**: One of: technical, billing, account, sales, feature_request, general
3. **severity**: One of: low, medium, high, critical
   - low: general questions, feature requests
   - medium: billing questions, minor issues
   - high: broken functionality, login failures
   - critical: data loss, security issues, complete outage
4. **summary**: A 1-2 sentence summary of the issue
5. **confidence**: 0.0-1.0 how confident you are
6. **language**: ISO 639-1 code (e.g., "en", "fr", "de")
7. **issueCategory**: Specific issue type for organizing tickets. Choose ONE:
   - Technical: login_issues, performance_slow, feature_not_working, data_sync_error, integration_problem, mobile_app_issue, browser_compatibility
   - Billing: payment_failed, subscription_cancel, refund_request, pricing_question, invoice_request
   - Account: password_reset, account_locked, profile_update, data_export, account_deletion
   - Other: how_to_question, feature_request, feedback, other

Respond ONLY with valid JSON matching this schema:
{
  "product": string,
  "intent": string,
  "severity": string,
  "summary": string,
  "confidence": number,
  "language": string,
  "issueCategory": string
}`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

export async function classifyEmail(
  subject: string,
  body: string,
  from: string
): Promise<EmailClassification> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `From: ${from}\nSubject: ${subject}\n\nBody:\n${body}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = JSON.parse(content);

    // Validate and normalize
    const confidence = Math.min(1, Math.max(0, parsed.confidence || 0.5));

    // Canonicalize the product slug via the registry. If the model could not
    // decide but the email explicitly names exactly one registered product,
    // use that product. A confident model decision is never overridden.
    const { product } = resolveProduct(
      parsed.product,
      confidence,
      `${subject}\n${body}`
    );

    return {
      product,
      intent: validateIntent(parsed.intent),
      severity: validateSeverity(parsed.severity),
      summary: parsed.summary || 'No summary available',
      confidence,
      language: parsed.language || 'en',
      issueCategory: validateIssueCategory(parsed.issueCategory, parsed.intent),
    };
  } catch (error) {
    console.error('Classification error:', error);

    // Return a safe fallback classification. If the email explicitly names
    // exactly one registered product, keep that product so KB retrieval still works.
    const named = detectExplicitProducts(`${subject}\n${body}`);
    return {
      product: named.length === 1 ? named[0].slug : 'unknown',
      intent: 'general',
      severity: 'medium',
      summary: `Email from ${from}: ${subject}`,
      confidence: 0,
      language: 'en',
      issueCategory: 'other',
    };
  }
}

function validateIntent(intent: string): IntentCategory {
  const valid: IntentCategory[] = [
    'technical',
    'billing',
    'account',
    'sales',
    'feature_request',
    'general',
  ];
  return valid.includes(intent as IntentCategory)
    ? (intent as IntentCategory)
    : 'general';
}

function validateSeverity(severity: string): Severity {
  const valid: Severity[] = ['low', 'medium', 'high', 'critical'];
  return valid.includes(severity as Severity)
    ? (severity as Severity)
    : 'medium';
}

function validateIssueCategory(category: string, intent: string): IssueCategory {
  const valid: IssueCategory[] = [
    'login_issues', 'performance_slow', 'feature_not_working', 'data_sync_error',
    'integration_problem', 'mobile_app_issue', 'browser_compatibility',
    'payment_failed', 'subscription_cancel', 'refund_request', 'pricing_question', 'invoice_request',
    'password_reset', 'account_locked', 'profile_update', 'data_export', 'account_deletion',
    'how_to_question', 'feature_request', 'feedback', 'other'
  ];
  
  if (valid.includes(category as IssueCategory)) {
    return category as IssueCategory;
  }
  
  // Fallback based on intent
  const intentDefaults: Record<string, IssueCategory> = {
    technical: 'feature_not_working',
    billing: 'pricing_question',
    account: 'profile_update',
    feature_request: 'feature_request',
    general: 'how_to_question',
    sales: 'pricing_question',
  };
  
  return intentDefaults[intent] || 'other';
}
