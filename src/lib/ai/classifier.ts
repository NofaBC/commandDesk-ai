import OpenAI from 'openai';
import type { EmailClassification, IntentCategory, Severity, IssueCategory } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are CommandDesk AI, an email classification system for NOFA AI Factory.

You analyze incoming customer support emails and extract structured metadata.

NOFA AI Factory products (match carefully based on keywords):

1. **CareerPilot AI™** (slug: careerpilot-ai)
   - Resume builder, CV creator, career platform
   - Keywords: resume, CV, job search, job matching, career, cover letter, job application, employment, LinkedIn, job board
   - This is the ONLY product for job seekers and career-related features

2. **TechSupport AI™** (slug: techsupport-ai)
   - AI customer support system
   - Keywords: support ticket, help desk, customer service

3. **VisionWing™** (slug: visionwing)
   - Visual content and image platform
   - Keywords: image, photo, visual, design

4. **MagazinifyAI™** (slug: magazinify-ai)
   - AI magazine and publication creation
   - Keywords: magazine, publication, article, editorial

5. **AffiliateLedger AI™** (slug: affiliateledger-ai)
   - Affiliate program management
   - Keywords: affiliate, commission, referral, partner program

6. **RFPMatch AI™** (slug: rfpmatch-ai)
   - Government/enterprise RFP (Request for Proposal) matching
   - Keywords: RFP, proposal, bid, government contract, procurement
   - NOTE: "job matching" is NOT this product - that's CareerPilot AI

IMPORTANT: If the email mentions resume, job, career, CV, cover letter, or employment-related features, it is ALWAYS CareerPilot AI (careerpilot-ai), NOT RFPMatch AI.

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
    return {
      product: parsed.product || 'unknown',
      intent: validateIntent(parsed.intent),
      severity: validateSeverity(parsed.severity),
      summary: parsed.summary || 'No summary available',
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      language: parsed.language || 'en',
      issueCategory: validateIssueCategory(parsed.issueCategory, parsed.intent),
    };
  } catch (error) {
    console.error('Classification error:', error);

    // Return a safe fallback classification
    return {
      product: 'unknown',
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
