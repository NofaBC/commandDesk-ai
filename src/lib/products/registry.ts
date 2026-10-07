/**
 * NOFA Product Registry
 *
 * Single source of truth for every NOFA AI Factory product (and knowledge
 * namespace) that CommandDesk AI knows about:
 *
 *   Registry -> Product identification -> Knowledge base (Pinecone namespace
 *   == slug) -> Response -> Technical escalation (existing TechSupport AI flow)
 *
 * To add a new product:
 *   1. Add one entry to PRODUCT_REGISTRY below.
 *   2. Add its documentation under knowledge-base/<slug>/*.md.
 *   3. Run `npm run sync-kb -- <slug>` to embed the docs into Pinecone.
 *
 * No other code changes are required: the classifier prompt, responder context,
 * product URLs, and dashboard dropdowns/labels are all derived from this file.
 *
 * IMPORTANT: this module must stay free of server-only imports so it can be
 * used from client components (dashboard) as well as server code.
 */

export type ProductKind = 'product' | 'platform' | 'general';

export interface ProductDefinition {
  /** Canonical slug. Also the Pinecone namespace used for knowledge retrieval. */
  slug: string;
  /** Display name, including trademark symbol. */
  name: string;
  kind: ProductKind;
  /** Whether the email classifier may assign this product to an incoming email. */
  classifiable: boolean;
  /** Previous brand names (rendered as "formerly known as ..."). */
  formerNames?: string[];
  /**
   * Explicit names that unambiguously identify this product in free text.
   * Matched case-insensitively on word boundaries; whitespace/hyphen tolerant.
   */
  aliases: string[];
  /** Older slugs that should resolve to this product. */
  legacySlugs?: string[];

  // ── Classifier prompt material ────────────────────────────────────────────
  /** Bullet lines describing the product (classifier prompt). */
  classifierDescription?: string[];
  /** Keyword hints (classifier prompt). */
  keywords?: string[];
  /** Extra bullet lines shown under this product in the classifier prompt. */
  classifierNotes?: string[];
  /** Global disambiguation rules appended to the classifier prompt. */
  classifierRules?: string[];

  // ── Responder / support material ──────────────────────────────────────────
  /** Where customers should be pointed for this product. */
  productUrl: string;
  /** Support address override (defaults to DEFAULT_SUPPORT_EMAIL). */
  supportEmail?: string;
  /**
   * Opt-in: answer pre-sales / how-it-works / pricing questions from senders who
   * are NOT in the CommandDesk `subscribers` collection, using the product KB.
   * Technical, billing and account issues from non-subscribers still receive the
   * standard redirect. Default false (existing behavior).
   */
  prospectInquiries?: boolean;
  /**
   * When true, auto-replies for this product must be grounded in retrieved KB
   * context. If retrieval returns nothing, a safe holding reply is sent instead
   * of letting the model answer from memory.
   */
  requireKnowledge?: boolean;
  /** Product-specific rules appended to the responder system prompt. */
  responderGuidance?: string[];
  /**
   * Questions the model must NOT answer. When an incoming email matches `pattern`
   * (case-insensitive regex source) the fixed `reply` is sent instead - no retrieval,
   * no LLM. For topics where even a "helpful" model answer (including a denial) is wrong.
   * Placeholders: {{productName}}, {{productUrl}}, {{supportEmail}}.
   */
  scriptedReplies?: ScriptedReply[];
}

export interface ScriptedReply {
  /** Short label for logs/tests. */
  name: string;
  /** RegExp source, matched case-insensitively against subject + body. */
  pattern: string;
  reply: string;
}

/** Official NOFA support address, used for every product unless it sets `supportEmail`. */
export const DEFAULT_SUPPORT_EMAIL = 'supportdesk@nofabusinessconsulting.com';
export const DEFAULT_PRODUCT_URL = 'https://nofabusinessconsulting.com';

export const PRODUCT_REGISTRY: ProductDefinition[] = [
  // ── Platform / general knowledge namespaces (not classifiable) ────────────
  {
    slug: 'nofa-ai-factory',
    name: 'NOFA AI Factory™',
    kind: 'platform',
    classifiable: false,
    aliases: [],
    productUrl: DEFAULT_PRODUCT_URL,
  },
  {
    slug: 'commanddesk-ai',
    name: 'CommandDesk AI™',
    kind: 'platform',
    classifiable: false,
    aliases: [],
    productUrl: DEFAULT_PRODUCT_URL,
  },

  // ── Products (order == order shown to the classifier) ─────────────────────
  {
    slug: 'dlyn-ai',
    name: 'Dlyn-AI™',
    kind: 'product',
    classifiable: true,
    formerNames: ['CareerPilot AI'],
    aliases: ['dlyn-ai', 'dlyn ai', 'dlyn', 'careerpilot ai', 'careerpilot'],
    legacySlugs: ['careerpilot-ai'],
    classifierDescription: [
      'Resume builder, CV creator, career platform',
    ],
    keywords: [
      'resume', 'CV', 'job search', 'job matching', 'career', 'cover letter',
      'job application', 'employment', 'LinkedIn', 'job board', 'CareerPilot', 'Dlyn',
    ],
    classifierNotes: [
      'This is the ONLY product for job seekers and career-related features',
      'NOTE: If the email mentions "CareerPilot AI" or "CareerPilot", it refers to Dlyn-AI (rebranded)',
    ],
    productUrl: 'https://nofabusinessconsulting.com/dlyn-ai/',
  },
  {
    slug: 'techsupport-ai',
    name: 'TechSupport AI™',
    kind: 'product',
    classifiable: true,
    aliases: ['techsupport-ai', 'techsupport ai', 'tech support ai'],
    classifierDescription: ['AI customer support system'],
    keywords: ['support ticket', 'help desk', 'customer service'],
    productUrl: 'https://nofabusinessconsulting.com/techsupport-ai/',
  },
  {
    slug: 'intelliscan-ai',
    name: 'IntelliScan AI™',
    kind: 'product',
    classifiable: true,
    aliases: ['intelliscan-ai', 'intelliscan ai', 'intelliscan'],
    classifierDescription: ['AI-powered vulnerability scanner for web applications'],
    keywords: [
      'security', 'vulnerability', 'scanner', 'penetration testing', 'OWASP',
      'security scan', 'web security', 'exploit', 'XSS', 'SQL injection', 'API security',
    ],
    productUrl: 'https://nofabusinessconsulting.com/intelliscan-ai/',
  },
  {
    slug: 'visionwing',
    name: 'VisionWing™',
    kind: 'product',
    classifiable: true,
    aliases: ['visionwing', 'vision wing'],
    classifierDescription: ['Visual content and image platform'],
    keywords: ['image', 'photo', 'visual', 'design'],
    productUrl: 'https://nofabusinessconsulting.com/visionwing/',
  },
  {
    slug: 'magazinify-ai',
    name: 'MagazinifyAI™',
    kind: 'product',
    classifiable: true,
    aliases: ['magazinify-ai', 'magazinify ai', 'magazinifyai', 'magazinify'],
    legacySlugs: ['magazinifyai'],
    classifierDescription: ['AI magazine and publication creation'],
    keywords: ['magazine', 'publication', 'article', 'editorial'],
    productUrl: 'https://nofabusinessconsulting.com/magazinifyai/',
  },
  {
    slug: 'affiliateledger-ai',
    name: 'AffiliateLedger AI™',
    kind: 'product',
    classifiable: true,
    aliases: ['affiliateledger-ai', 'affiliateledger ai', 'affiliateledger', 'affiliate ledger'],
    classifierDescription: ['Affiliate program management'],
    keywords: ['affiliate', 'commission', 'referral', 'partner program'],
    productUrl: 'https://nofabusinessconsulting.com/affiliateledger-ai/',
  },
  {
    slug: 'rfpmatch-ai',
    name: 'RFPMatch AI™',
    kind: 'product',
    classifiable: true,
    aliases: ['rfpmatch-ai', 'rfpmatch ai', 'rfpmatch', 'rfp match'],
    classifierDescription: ['Government/enterprise RFP (Request for Proposal) matching'],
    keywords: ['RFP', 'proposal', 'bid', 'government contract', 'procurement'],
    classifierNotes: [
      'NOTE: "job matching" is NOT this product - that\'s CareerPilot AI',
    ],
    productUrl: 'https://nofabusinessconsulting.com/rfpmatch-ai/',
  },
  {
    slug: 'judybid-analyze',
    name: 'JudyBid Analyze™',
    kind: 'product',
    classifiable: true,
    aliases: [
      'judybid-analyze', 'judybid analyze', 'judy bid analyze',
      'judybid', 'judy bid', 'judybid watch',
    ],
    classifierDescription: [
      'Government bid review and opportunity matching assistant for small businesses (also called JudyBid™)',
      'Searches live SAM.gov (federal) and state/local/education procurement sources, reads an uploaded capability statement (PDF/TXT), and scores opportunities for fit',
    ],
    keywords: [
      'JudyBid', 'JudyBid Analyze', 'capability statement', 'SAM.gov', 'NAICS',
      'set-aside', 'state and local bids', 'SLED', 'solicitation', 'bid opportunity',
      'opportunity search', 'live search', 'fit score', 'match results',
    ],
    classifierNotes: [
      'Questions about how JudyBid searches, matches or scores, why an opportunity is missing or appears, uploading a capability statement, live-search limits, features, or the subscription price are intent "general" or "sales" (issueCategory how_to_question or pricing_question) - NOT "technical"',
      'Use intent "technical" only for real defects: error messages, pages not loading, sign-in or checkout failures, or a feature that appears broken',
      'NOTE: JudyVA, JudyTutor and JudyProspect are different products - only "JudyBid" refers to this one',
    ],
    classifierRules: [
      'IMPORTANT: Emails that mention JudyBid, JudyBid Analyze, capability statements, SAM.gov searches, NAICS/set-aside matching, or state/local bid search are JudyBid Analyze (judybid-analyze). Generic RFP/proposal/procurement mentions with none of those signals stay RFPMatch AI (rfpmatch-ai).',
    ],
    // JudyBid has no dedicated page on nofabusinessconsulting.com; the app (production domain
    // of the judybid-analyze Vercel project) is the product page.
    productUrl: 'https://www.judybid.com/',
    prospectInquiries: true,
    requireKnowledge: true,
    responderGuidance: [
      'Answer ONLY from the "Relevant documentation" provided. Never invent JudyBid features, prices, limits, data coverage, dates, or policies that are not in it.',
      'If the documentation does not cover the question, say you do not have that detail and invite the customer to reply or contact the support address.',
      'Absence from the documentation means you do NOT KNOW. Never say JudyBid "does not offer", "does not support", "has no", or "is not designed for" something (an integration, API, certification, platform, deployment option, feature, or limit) unless the documentation explicitly says so, and never say it does unless the documentation says so. Answer only the parts the documentation covers; for every other part say "I do not have that detail" and give the support address.',
      'JudyBid advises; the user decides. Never promise contract awards, eligibility, compliance, or legal advice. JudyBid does not submit bids, write proposals, or send alerts. JudyBid Watch™ is a planned future product, not a current one.',
      'JudyBid scoring is rule-based fit scoring from listing information (title/description, agency, NAICS, set-aside, dates, location). Do not describe it as AI-written bid analysis or as reading full solicitation documents.',
      'For cancellations, refunds, invoices, or account-specific billing changes: say the NOFA support team handles these and give the support address. Do not promise refunds or describe a refund policy. Do not refer customers to a billing dashboard or account portal; none is documented for JudyBid.',
      'If the customer says an expected opportunity is missing: explain the relevant causes from the documentation, then ask for the solicitation number or link, the NAICS codes and keywords in their profile, their service area, and which Opportunity Source they selected.',
      'Never reveal, confirm, or deny internal, advisor, or test access. (Questions about special, free, or bypass access are answered by a fixed scripted reply before reaching you.)',
    ],
    scriptedReplies: [
      {
        // Advisor/tester/bypass/free-access probes. Must neither reveal nor confirm nor deny that
        // any internal access exists, so the answer is fixed text, not model output.
        name: 'special-access',
        pattern:
          '\\b(?:advisor|adviser|tester|testing|test|demo|bypass|special|free|secret|hidden|backdoor|promo|beta)\\s+(?:access|token|login|code|key|account|url|link|parameter|mode)\\b' +
          '|\\bunlock\\b[^.?!]*\\bwithout\\s+(?:paying|a\\s+subscription|subscribing|payment)\\b' +
          '|\\bwithout\\s+paying\\b' +
          '|\\b(?:backdoor|back\\s+door)\\b' +
          '|\\bbypass\\w*\\b[^.?!]*\\b(?:paywall|subscription|payment|paying|limit|login)\\b',
        reply:
          'Thank you for contacting NOFA AI Support about {{productName}}.\n\n' +
          'Live search in {{productName}} requires an active JudyBid subscription; subscription details are available at {{productUrl}}. ' +
          'For anything else about access, please contact us at {{supportEmail}}.\n\n' +
          'Best regards,\nNOFA AI Support Team',
      },
    ],
  },

  // ── Catch-all knowledge namespace ─────────────────────────────────────────
  {
    slug: 'general',
    name: 'General (All Products)',
    kind: 'general',
    classifiable: false,
    aliases: [],
    productUrl: DEFAULT_PRODUCT_URL,
  },
];

// ── Lookup helpers ───────────────────────────────────────────────────────────

/** Resolve a slug (canonical or legacy) to its product definition. */
export function getProduct(slug: string | null | undefined): ProductDefinition | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase().trim();
  return PRODUCT_REGISTRY.find(
    (p) => p.slug === s || p.legacySlugs?.some((l) => l === s)
  );
}

/** Products the email classifier may assign (registry order preserved). */
export function getClassifiableProducts(): ProductDefinition[] {
  return PRODUCT_REGISTRY.filter((p) => p.classifiable);
}

export function getProductUrl(slug: string): string {
  return getProduct(slug)?.productUrl ?? DEFAULT_PRODUCT_URL;
}

export function getSupportEmail(slug: string): string {
  return getProduct(slug)?.supportEmail ?? DEFAULT_SUPPORT_EMAIL;
}

export function getProductName(slug: string): string | undefined {
  return getProduct(slug)?.name;
}

/**
 * If the email text matches one of the product's scripted-reply rules, return the
 * fixed reply (placeholders filled in); otherwise null.
 */
export function findScriptedReply(
  slug: string,
  text: string
): { name: string; reply: string } | null {
  const product = getProduct(slug);
  if (!product?.scriptedReplies?.length || !text) return null;
  for (const rule of product.scriptedReplies) {
    if (new RegExp(rule.pattern, 'i').test(text)) {
      return {
        name: rule.name,
        reply: rule.reply
          .replaceAll('{{productName}}', product.name)
          .replaceAll('{{productUrl}}', product.productUrl)
          .replaceAll('{{supportEmail}}', product.supportEmail ?? DEFAULT_SUPPORT_EMAIL),
      };
    }
  }
  return null;
}

/** Dashboard dropdown options (knowledge-base uploader). */
export function getKnowledgeProductOptions(): { value: string; label: string }[] {
  return PRODUCT_REGISTRY.map((p) => ({ value: p.slug, label: p.name }));
}

/** Slug -> label map (dashboard document list). Includes legacy slugs. */
export function getProductLabels(): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const p of PRODUCT_REGISTRY) {
    labels[p.slug] = p.name;
    p.legacySlugs?.forEach((l) => {
      labels[l] = p.formerNames?.[0] ? `${p.formerNames[0]}™` : p.name;
    });
  }
  return labels;
}
