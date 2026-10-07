/**
 * Offline tests for the NOFA product registry and JudyBid integration.
 * No network, no credentials required.
 *
 *   npm run test:products
 */

// Must be the first import: sets a placeholder OPENAI_API_KEY (no request is ever made here).
import './_offline-env';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  PRODUCT_REGISTRY,
  getProduct,
  getProductUrl,
  getSupportEmail,
  getKnowledgeProductOptions,
  getProductLabels,
  findScriptedReply,
  DEFAULT_SUPPORT_EMAIL,
} from '../src/lib/products/registry';
import {
  buildClassifierProductList,
  buildClassifierRules,
  canonicalizeProductSlug,
  detectExplicitProducts,
  resolveProduct,
} from '../src/lib/products/identify';
import { buildSystemPrompt } from '../src/lib/ai/classifier';
import { getSystemPrompt } from '../src/lib/ai/responder';
import { chunkText } from '../src/lib/knowledge-base/chunker';
import { getProspectCandidateProducts, isProspectEligible } from '../src/lib/routing/prospect';
import type { EmailClassification } from '../src/types';

let passed = 0;
let failed = 0;
const failures: string[] = [];
let currentSection = '';

function section(name: string) {
  currentSection = name;
  console.log(`\n== ${name}`);
}

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(`[${currentSection}] ${name}${detail ? ' -> ' + detail : ''}`);
    console.log(`  FAIL  ${name}${detail ? ' -> ' + detail : ''}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Registry integrity
// ────────────────────────────────────────────────────────────────────────────
section('Registry integrity');
{
  const slugs = PRODUCT_REGISTRY.map((p) => p.slug);
  check('slugs are unique', new Set(slugs).size === slugs.length);

  const seen = new Map<string, string>();
  const collisions: string[] = [];
  for (const p of PRODUCT_REGISTRY) {
    for (const a of p.aliases) {
      const key = a.toLowerCase().replace(/[\s-]+/g, '');
      const owner = seen.get(key);
      if (owner && owner !== p.slug) collisions.push(`${a} (${owner} vs ${p.slug})`);
      seen.set(key, p.slug);
    }
  }
  check('no alias collides across products', collisions.length === 0, collisions.join('; '));

  check(
    'every classifiable product has a URL and at least one alias',
    PRODUCT_REGISTRY.filter((p) => p.classifiable).every(
      (p) => p.productUrl.startsWith('https://') && p.aliases.length > 0
    )
  );

  const judy = getProduct('judybid-analyze');
  check('judybid-analyze is registered and classifiable', !!judy && judy.classifiable);
  check(
    'judybid-analyze URL is the production domain',
    getProductUrl('judybid-analyze') === 'https://www.judybid.com/'
  );
  check(
    'judybid-analyze support email is supportdesk@',
    getSupportEmail('judybid-analyze') === 'supportdesk@nofabusinessconsulting.com'
  );
  check(
    'official support email is supportdesk@ for EVERY product (default)',
    DEFAULT_SUPPORT_EMAIL === 'supportdesk@nofabusinessconsulting.com' &&
      PRODUCT_REGISTRY.every((p) => getSupportEmail(p.slug) === 'supportdesk@nofabusinessconsulting.com')
  );
  {
    // Guard: the old default address must not reappear anywhere in application source.
    const stale: string[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name) && readFileSync(p, 'utf-8').includes('support@nofabusinessconsulting.com')) stale.push(p);
      }
    };
    walk(join(process.cwd(), 'src'));
    check('no source file uses support@nofabusinessconsulting.com', stale.length === 0, stale.join(', '));
  }
  check(
    'only judybid-analyze opts into prospect inquiries',
    PRODUCT_REGISTRY.filter((p) => p.prospectInquiries).map((p) => p.slug).join() ===
      'judybid-analyze'
  );

  const kbDir = join(process.cwd(), 'knowledge-base');
  const missingKb = PRODUCT_REGISTRY.filter((p) => p.slug === 'judybid-analyze').filter(
    (p) => !existsSync(join(kbDir, p.slug))
  );
  check('knowledge-base/judybid-analyze exists', missingKb.length === 0);

  const options = getKnowledgeProductOptions().map((o) => o.value);
  for (const slug of [
    'nofa-ai-factory', 'dlyn-ai', 'intelliscan-ai', 'magazinify-ai', 'rfpmatch-ai',
    'techsupport-ai', 'commanddesk-ai', 'visionwing', 'affiliateledger-ai', 'general',
    'judybid-analyze',
  ]) {
    check(`dashboard dropdown offers "${slug}"`, options.includes(slug));
  }
  const labels = getProductLabels();
  check('dashboard label for judybid-analyze', labels['judybid-analyze'] === 'JudyBid Analyze™');
  check('legacy careerpilot-ai label still resolves', !!labels['careerpilot-ai']);
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Regression baseline: existing products unchanged
// ────────────────────────────────────────────────────────────────────────────
section('Regression: existing product behavior preserved');
{
  // Frozen copy of the pre-JudyBid per-product URL map (responder.ts @ 680d34b).
  const baselineUrls: Record<string, string> = {
    'dlyn-ai': 'https://nofabusinessconsulting.com/dlyn-ai/',
    'techsupport-ai': 'https://nofabusinessconsulting.com/techsupport-ai/',
    'intelliscan-ai': 'https://nofabusinessconsulting.com/intelliscan-ai/',
    visionwing: 'https://nofabusinessconsulting.com/visionwing/',
    'affiliateledger-ai': 'https://nofabusinessconsulting.com/affiliateledger-ai/',
    'rfpmatch-ai': 'https://nofabusinessconsulting.com/rfpmatch-ai/',
  };
  for (const [slug, url] of Object.entries(baselineUrls)) {
    check(`URL unchanged for ${slug}`, getProductUrl(slug) === url, getProductUrl(slug));
  }
  check(
    'unknown product still falls back to the homepage',
    getProductUrl('unknown') === 'https://nofabusinessconsulting.com'
  );
  check(
    'existing products use the official support email (corrected from support@)',
    ['dlyn-ai', 'intelliscan-ai', 'rfpmatch-ai', 'techsupport-ai'].every(
      (s) => getSupportEmail(s) === 'supportdesk@nofabusinessconsulting.com'
    )
  );

  // Frozen copy of the pre-JudyBid classifier prompt product blocks (classifier.ts @ 680d34b).
  const baselineBlocks = [
    `1. **Dlyn-AI™** (slug: dlyn-ai) — formerly known as CareerPilot AI
   - Resume builder, CV creator, career platform
   - Keywords: resume, CV, job search, job matching, career, cover letter, job application, employment, LinkedIn, job board, CareerPilot, Dlyn
   - This is the ONLY product for job seekers and career-related features
   - NOTE: If the email mentions "CareerPilot AI" or "CareerPilot", it refers to Dlyn-AI (rebranded)`,
    `2. **TechSupport AI™** (slug: techsupport-ai)
   - AI customer support system
   - Keywords: support ticket, help desk, customer service`,
    `3. **IntelliScan AI™** (slug: intelliscan-ai)
   - AI-powered vulnerability scanner for web applications
   - Keywords: security, vulnerability, scanner, penetration testing, OWASP, security scan, web security, exploit, XSS, SQL injection, API security`,
    `4. **VisionWing™** (slug: visionwing)
   - Visual content and image platform
   - Keywords: image, photo, visual, design`,
    `5. **MagazinifyAI™** (slug: magazinify-ai)
   - AI magazine and publication creation
   - Keywords: magazine, publication, article, editorial`,
    `6. **AffiliateLedger AI™** (slug: affiliateledger-ai)
   - Affiliate program management
   - Keywords: affiliate, commission, referral, partner program`,
    `7. **RFPMatch AI™** (slug: rfpmatch-ai)
   - Government/enterprise RFP (Request for Proposal) matching
   - Keywords: RFP, proposal, bid, government contract, procurement
   - NOTE: "job matching" is NOT this product - that's CareerPilot AI`,
  ];
  const prompt = buildSystemPrompt();
  baselineBlocks.forEach((block, i) =>
    check(`classifier prompt block ${i + 1} is byte-identical to baseline`, prompt.includes(block))
  );
  check(
    'classifier prompt keeps the Dlyn/CareerPilot IMPORTANT rules',
    prompt.includes('it is ALWAYS Dlyn-AI (dlyn-ai), NOT RFPMatch AI.') &&
      prompt.includes('Any mention of CareerPilot should be classified as dlyn-ai.')
  );
  check(
    'classifier prompt keeps the JSON schema',
    prompt.includes('Respond ONLY with valid JSON matching this schema:')
  );

  // Responder system prompt for an existing product only changes by the product list.
  const dlynPrompt = getSystemPrompt('dlyn-ai');
  check(
    'Dlyn responder prompt: same product page, official support email',
    dlynPrompt.includes('- Product page: https://nofabusinessconsulting.com/dlyn-ai/') &&
      dlynPrompt.includes('- Support email: supportdesk@nofabusinessconsulting.com') &&
      !dlynPrompt.includes('support@nofabusinessconsulting.com')
  );
  check(
    'Dlyn responder prompt has no product-specific JudyBid rules',
    !dlynPrompt.includes('Product-specific rules') && !dlynPrompt.includes('JudyBid Watch')
  );
  check(
    'responder company context lists the original seven products (+ JudyBid)',
    dlynPrompt.includes(
      'Dlyn-AI™ (formerly CareerPilot AI™), TechSupport AI™, IntelliScan AI™, VisionWing™, MagazinifyAI™, AffiliateLedger AI™, RFPMatch AI™, JudyBid Analyze™'
    )
  );

  check('careerpilot-ai legacy slug resolves to dlyn-ai', canonicalizeProductSlug('careerpilot-ai') === 'dlyn-ai');
  check('magazinifyai legacy slug resolves to magazinify-ai', canonicalizeProductSlug('magazinifyai') === 'magazinify-ai');
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Classifier prompt: JudyBid is a first-class product
// ────────────────────────────────────────────────────────────────────────────
section('Classifier prompt includes JudyBid');
{
  const prompt = buildSystemPrompt();
  const list = buildClassifierProductList();
  check('prompt lists JudyBid Analyze™ with its slug', list.includes('8. **JudyBid Analyze™** (slug: judybid-analyze)'));
  check('prompt mentions capability statement + SAM.gov + NAICS', /capability statement/.test(prompt) && /SAM\.gov/.test(prompt) && /NAICS/.test(prompt));
  check('prompt tells the model how-to/pricing questions are NOT technical', /NOT "technical"/.test(prompt));
  check('RFPMatch vs JudyBid disambiguation rule present', buildClassifierRules().includes('stay RFPMatch AI (rfpmatch-ai)'));
  check('JudyVA/JudyTutor/JudyProspect are called out as different products', /JudyVA, JudyTutor and JudyProspect/.test(prompt));
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Product identification (deterministic layer)
// ────────────────────────────────────────────────────────────────────────────
section('Product identification');
{
  const named = (t: string) => detectExplicitProducts(t).map((p) => p.slug).join(',');

  check('"JudyBid" -> judybid-analyze', named('How does JudyBid find government contracts?') === 'judybid-analyze');
  check('"JudyBid Analyze™" -> judybid-analyze', named('Is JudyBid Analyze™ worth it?') === 'judybid-analyze');
  check('"Judy Bid" (spaced) -> judybid-analyze', named('what is judy bid') === 'judybid-analyze');
  check('"judybid-analyze.vercel.app" -> judybid-analyze', named('I opened https://judybid-analyze.vercel.app/ today') === 'judybid-analyze');
  check('JudyVA is NOT JudyBid', named('Does JudyVA answer phone calls?') === '');
  check('"Judy" alone is NOT JudyBid', named('Judy from accounting asked about this') === '');
  check('Dlyn-AI by name -> dlyn-ai', named('Dlyn-AI resume builder question') === 'dlyn-ai');
  check('CareerPilot -> dlyn-ai', named('My CareerPilot subscription') === 'dlyn-ai');
  check('IntelliScan -> intelliscan-ai', named('Does IntelliScan check OWASP?') === 'intelliscan-ai');
  check('RFPMatch -> rfpmatch-ai', named('Question about RFPMatch AI pricing') === 'rfpmatch-ai');
  check('two products named -> both detected (ambiguous)', named('Moving from RFPMatch to JudyBid').split(',').length === 2);

  // resolveProduct: model decision vs. explicit-name safety net
  const r1 = resolveProduct('unknown', 0.2, 'How does JudyBid work?');
  check('undecided model + explicit JudyBid -> judybid-analyze', r1.product === 'judybid-analyze' && r1.source === 'explicit-name');
  const r2 = resolveProduct('rfpmatch-ai', 0.9, 'How does JudyBid work?');
  check('confident model decision is never overridden', r2.product === 'rfpmatch-ai' && r2.source === 'model');
  const r3 = resolveProduct('dlyn-ai', 0.4, 'Moving from RFPMatch to JudyBid');
  check('ambiguous (two named) low confidence keeps model product', r3.product === 'dlyn-ai');
  const r4 = resolveProduct('JudyBid Analyze™', 0.9, 'x');
  check('model emitting display name is canonicalized', r4.product === 'judybid-analyze');
  check('model emitting "judybid" alias is canonicalized', canonicalizeProductSlug('judybid') === 'judybid-analyze');
  check('unrecognized model output is preserved (existing behavior)', canonicalizeProductSlug('some-new-thing') === 'some-new-thing');
  check('empty model output -> unknown', canonicalizeProductSlug('') === 'unknown');
  const r5 = resolveProduct('unknown', 0.1, 'Do you build websites?');
  check('no explicit product -> stays unknown', r5.product === 'unknown');
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Prospect / non-subscriber gate rules
// ────────────────────────────────────────────────────────────────────────────
section('Prospect inquiry rules (registry opt-in)');
{
  const c = (over: Partial<EmailClassification>): EmailClassification => ({
    product: 'judybid-analyze', intent: 'sales', severity: 'low', summary: 's',
    confidence: 0.9, language: 'en', issueCategory: 'how_to_question', ...over,
  });

  check('JudyBid sales question from non-subscriber is answered', isProspectEligible(c({ intent: 'sales' })));
  check('JudyBid general how-it-works is answered', isProspectEligible(c({ intent: 'general' })));
  check('JudyBid pricing question classified as billing is answered', isProspectEligible(c({ intent: 'billing', issueCategory: 'pricing_question' })));
  check('JudyBid technical issue keeps the redirect', !isProspectEligible(c({ intent: 'technical', issueCategory: 'feature_not_working' })));
  check('JudyBid account issue keeps the redirect', !isProspectEligible(c({ intent: 'account', issueCategory: 'login_issues' })));
  check('JudyBid payment failure keeps the redirect', !isProspectEligible(c({ intent: 'billing', issueCategory: 'payment_failed' })));
  check('critical severity keeps the redirect', !isProspectEligible(c({ severity: 'critical' })));
  check('Dlyn-AI sales question is NOT opened up (unchanged)', !isProspectEligible(c({ product: 'dlyn-ai' })));
  check('IntelliScan sales question is NOT opened up (unchanged)', !isProspectEligible(c({ product: 'intelliscan-ai' })));
  check('unknown product is NOT opened up', !isProspectEligible(c({ product: 'unknown' })));

  const cand = (t: string) => getProspectCandidateProducts(t).map((p) => p.slug).join(',');
  check('pre-filter: JudyBid text is a candidate', cand('How does JudyBid find contracts?') === 'judybid-analyze');
  check('pre-filter: capability statement/SAM.gov text is a candidate', cand('Can the tool read my capability statement and search SAM.gov?') === 'judybid-analyze');
  check('pre-filter: Dlyn resume mail is NOT a candidate (no extra LLM call)', cand('How do I build a resume with Dlyn-AI?') === '');
  check('pre-filter: IntelliScan mail is NOT a candidate', cand('Does IntelliScan scan for XSS?') === '');
  check('pre-filter: empty text is NOT a candidate', cand('') === '');
}

// ────────────────────────────────────────────────────────────────────────────
// Scripted replies (restricted topics answered without the LLM)
// ────────────────────────────────────────────────────────────────────────────
section('Scripted replies (JudyBid special-access rule)');
{
  const hit = (t: string) => findScriptedReply('judybid-analyze', t)?.name ?? null;
  const mustHit = [
    'Is there an advisor or test access token or special URL parameter that unlocks JudyBid live search without paying?',
    'Do you have a demo account or tester login I can use?',
    'Is there a bypass or backdoor to use live search for free?',
    'Can I get free access without paying for a subscription? I want to unlock live search without a subscription.',
    'Any promo code or beta access?',
  ];
  mustHit.forEach((t) => check(`special-access rule matches: "${t.slice(0, 60)}..."`, hit(t) === 'special-access'));

  // Ordinary JudyBid questions (and every live scenario email) must NOT be hijacked.
  const mustMiss = [
    'How does JudyBid find government contracts?',
    'Can JudyBid analyze my capability statement? How do I upload it, and what file types work?',
    'How does JudyBid search for federal government opportunities? Which sources does it use?',
    'Does JudyBid search state and local opportunities too? My company is in Georgia.',
    'I subscribed to JudyBid yesterday and was charged, but now the page shows an error and then freezes.',
    'Is JudyBid appropriate for a 3-person landscaping company in Ohio, and what does it cost?',
    "JudyBid isn't finding a Maryland IT solicitation that was posted last month.",
    'How much is JudyBid per month? Is there a free trial or a refund if it does not work for us?',
    'What happens when I reach my 100 live searches? Do I need to pay for more?',
    'I paid for JudyBid but it still says a subscription is required.',
  ];
  mustMiss.forEach((t) => check(`special-access rule does NOT match: "${t.slice(0, 60)}..."`, hit(t) === null));

  const r = findScriptedReply('judybid-analyze', mustHit[0])!.reply;
  check('scripted reply: names JudyBid, official URL, supportdesk@', r.includes('JudyBid Analyze™') && r.includes('https://www.judybid.com/') && r.includes('supportdesk@nofabusinessconsulting.com'));
  check('scripted reply: states subscription requirement without a hard-coded price', /requires an active JudyBid subscription/.test(r) && !/\$\d/.test(r));
  check('scripted reply: never confirms or denies, never mentions tokens/parameters', !/token|parameter|advisor|tester|unfortunately|no options|does not exist|exists/i.test(r));
  check('scripted reply: no unfilled placeholders', !/\{\{/.test(r));
  check('other products have no scripted replies (unchanged)', ['dlyn-ai', 'intelliscan-ai', 'rfpmatch-ai', 'techsupport-ai'].every((s) => findScriptedReply(s, mustHit[0]) === null));
}

// ────────────────────────────────────────────────────────────────────────────
// Legacy script guard (never executed here - it would write to the default namespace)
// ────────────────────────────────────────────────────────────────────────────
section('Legacy update-knowledge-base.mjs guard');
{
  const legacy = readFileSync(join(process.cwd(), 'scripts', 'update-knowledge-base.mjs'), 'utf-8');
  check('legacy script skips judybid-analyze', /REGISTRY_MANAGED_PRODUCTS\s*=\s*new Set\(\[[^\]]*'judybid-analyze'/.test(legacy));
  check('legacy script filters files through the guard', /allFiles\.filter\(\(f\) => !REGISTRY_MANAGED_PRODUCTS\.has\(extractProductSlug\(f\)\)\)/.test(legacy));
  check('legacy script points to sync-kb', /npm run sync-kb/.test(legacy));
  check('follow-ups doc records the default-namespace debt', /default\)? Pinecone namespace|DEFAULT namespace|default namespace/i.test(readFileSync(join(process.cwd(), 'docs', 'follow-ups.md'), 'utf-8')));
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Responder prompt for JudyBid
// ────────────────────────────────────────────────────────────────────────────
section('Responder prompt for JudyBid');
{
  const p = getSystemPrompt('judybid-analyze');
  check('points customers to the JudyBid app URL', p.includes('- Product page: https://www.judybid.com/'));
  check('uses JudyBid support address', p.includes('- Support email: supportdesk@nofabusinessconsulting.com'));
  check('forbids inventing features/prices', /Never invent JudyBid features, prices/.test(p));
  check('absence of documentation means "do not know" (no inferred negatives)', /Absence from the documentation means you do NOT KNOW/.test(p) && /does not offer/.test(p));
  check('forbids describing JudyBid Watch as available', /JudyBid Watch™ is a planned future product/.test(p));
  check('internal/advisor access: model told never to reveal/confirm/deny', /Never reveal, confirm, or deny internal, advisor, or test access/.test(p));
  check('forbids promising refunds / billing dashboard', /Do not promise refunds/.test(p) && /billing dashboard/.test(p));
  check('keeps the sign-off rule', /Sign off as "NOFA AI Support Team"/.test(p));
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Knowledge base: coverage (offline lexical retrieval) and safety
// ────────────────────────────────────────────────────────────────────────────
section('JudyBid knowledge base content');
{
  const dir = join(process.cwd(), 'knowledge-base', 'judybid-analyze');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  const core = files.filter((f) => !f.includes('-qa-'));
  const cards = files.filter((f) => f.includes('-qa-'));
  check('six core KB documents present', core.length === 6, core.join(', '));
  check('quick-answer cards present', cards.length >= 4, cards.join(', '));
  check(
    'each quick-answer card is exactly one chunk (focused retrieval)',
    cards.every((f) => chunkText(readFileSync(join(dir, f), 'utf-8')).length === 1)
  );

  const all = files.map((f) => ({ file: f, text: readFileSync(join(dir, f), 'utf-8') }));
  const joined = all.map((a) => a.text).join('\n');

  // Safety: nothing internal/secret leaked into the customer-facing KB.
  check('no advisor token / test-access details in KB', !/judybid-v1|advisor_test|ADVISOR/i.test(joined));
  check('no API keys or env var names in KB', !/SAM_API_KEY|TANGO_API_KEY|STRIPE_SECRET|FIREBASE_ADMIN|sk_live|whsec_/i.test(joined));
  check('every KB document names JudyBid', all.every((a) => /JudyBid/.test(a.text)));

  // Key facts (source of truth: judybid-analyze repo @ 510b61d).
  const fact = (name: string, re: RegExp) => check(`KB states: ${name}`, re.test(joined));
  fact('$99 per month', /\$99 per month/);
  fact('100 live searches per billing period', /100 live searches per monthly billing period/);
  fact('SAM.gov federal source', /SAM\.gov/);
  fact('SLED state/local/education source', /SLED/);
  fact('PDF and TXT capability statements, 5 MB', /PDF and TXT only, up to 5 MB/);
  fact('no OCR for scanned PDFs', /does not perform OCR/);
  fact('90-day federal posting window', /last 90 days/);
  fact('portal fallback message', /Open Source Portal/);
  fact('score labels', /Strong fit \(70% and above\)/);
  fact('support email', /supportdesk@nofabusinessconsulting\.com/);
  fact('app URL', /https:\/\/www\.judybid\.com\//);
  check('KB does not reference the old vercel.app address', !/judybid-analyze\.vercel\.app/.test(joined));
  check('KB uses only the official support email', !/\bsupport@nofabusinessconsulting\.com/.test(joined));
  fact('JudyBid Watch is not available', /JudyBid Watch™[^.]*not (a current product|available)/);
  fact('disclaimer: no legal advice / no award guarantee', /does not provide legal advice, guarantee awards/);
  fact('undefined items are flagged (free trial / refund)', /free trial[^.]*refund policy/);

  // Offline lexical retrieval proxy: for each scenario the right passage must rank in the top 5
  // chunks (production queryKnowledgeBase uses topK = 5). This is only a content-coverage check;
  // real embedding retrieval is verified by the live suite (npm run test:support).
  type Chunk = { file: string; text: string; tokens: string[] };
  const tok = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9.\s/-]/g, ' ').split(/\s+/).filter((t) => t.length > 2);
  const stop = new Set(['the','and','for','you','your','are','how','does','can','with','that','this','what','not','has','have','will','from','they','their','its','but','any','all','our','out','who']);
  const chunks: Chunk[] = all.flatMap((a) =>
    chunkText(a.text).map((c) => ({ file: a.file, text: c.text, tokens: tok(c.text) }))
  );
  const df = new Map<string, number>();
  chunks.forEach((c) => new Set(c.tokens).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  // BM25 (k1 = 1.5, b = 0.75): term frequency + length normalization.
  const avgLen = chunks.reduce((s, c) => s + c.tokens.length, 0) / chunks.length;
  const search = (q: string, k = 5) => {
    const qt = tok(q).filter((t) => !stop.has(t));
    return chunks
      .map((c) => {
        const tf = new Map<string, number>();
        c.tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
        const score = qt.reduce((s, t) => {
          const f = tf.get(t) || 0;
          if (!f) return s;
          const n = df.get(t) || 1;
          const idf = Math.log(1 + (chunks.length - n + 0.5) / (n + 0.5));
          return s + (idf * f * 2.5) / (f + 1.5 * (0.25 + (0.75 * c.tokens.length) / avgLen));
        }, 0);
        return { c, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((r) => r.c);
  };

  const cover = (label: string, q: string, expect: RegExp) => {
    const top = search(q);
    check(`retrieval covers: ${label}`, top.some((c) => expect.test(c.text)), top.map((c) => c.file).join(', '));
  };
  cover('how JudyBid finds government contracts', 'How does JudyBid find government contracts?', /connected live sources[\s\S]*SAM\.gov|SAM\.gov[\s\S]*connected/);
  cover('capability statement analysis', 'Can JudyBid analyze my capability statement?', /matching signals|six-digit numbers/);
  cover('capability statement upload steps', 'How do I upload my capability statement?', /Upload Capability Statement/);
  cover('federal search sources', 'How do I search for federal government opportunities and which sources?', /SAM\.gov/);
  cover('state/local search', 'Does JudyBid search state and local opportunities?', /State \/ Local/);
  cover('portal fallback', 'Why does the link only open a portal and not the solicitation?', /Open Source Portal/);
  cover('expected opportunity missing', "JudyBid isn't finding an opportunity I expected", /posted more than 90 days ago|last 90 days/);
  cover('pricing', 'How much does JudyBid cost per month?', /\$99/);
  cover('appropriateness for a business', 'Is JudyBid right for my small business?', /small businesses/);
  cover('technical: subscription not unlocking', 'I subscribed but JudyBid still says subscription required', /signed in with when you subscribed|same account/);
  cover('limits: monthly search cap', 'I reached my monthly live-search limit', /100 live searches/);
}

// ────────────────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
