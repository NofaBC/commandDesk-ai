import OpenAI from 'openai';
import type { EmailClassification, IntentCategory, Severity } from '@/types';

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

Respond ONLY with valid JSON matching this schema:
{
  "product": string,
  "intent": string,
  "severity": string,
  "summary": string,
  "confidence": number,
  "language": string
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
