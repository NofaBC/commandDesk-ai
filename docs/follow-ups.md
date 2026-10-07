# Follow-ups and technical debt

Found while integrating JudyBid Analyze™ into CommandDesk AI. None of these are
addressed by the JudyBid integration change; each is a separate work item.

## PRIORITY for the next CommandDesk work session: no generic product claims without an approved KB
Live testing showed IntelliScan AI and RFPMatch AI (and any product without a dedicated KB
namespace) can receive model-generated replies with no authoritative product knowledge:
IntelliScan was answered from a generic `general` chunk and contradicted its own docs, and
RFPMatch (0 chunks retrieved) got a generic reply with unverified feature claims.
CommandDesk must not make generic model-generated product claims when an approved product KB is
unavailable. JudyBid already has this protection (`requireKnowledge` + the deterministic holding
reply); extend it to every product, and load approved KBs for IntelliScan AI, RFPMatch AI,
NOFA AI Factory and CommandDesk AI (see item 5).

## Separate follow-up items (explicitly deferred)

### 1. Stripe / subscriber synchronization (CommandDesk <-> JudyBid)
- CommandDesk gates support on its own Firestore `subscribers` collection
  (`src/lib/auth/subscriber.ts`, `src/lib/firebase/subscribers.ts`).
- JudyBid subscribers are billed through JudyBid's own Stripe account and stored in
  JudyBid's Firebase project (`users/{uid}.subscription`). Nothing syncs them into
  `subscribers`.
- Effect: a paying JudyBid customer who emails a technical problem is treated as a
  non-subscriber and receives the standard "inbox reserved for subscribers" redirect, so
  the TechSupport AI escalation does not run for them. (Prospect / how-it-works / pricing
  questions ARE answered, via the registry opt-in `prospectInquiries`.)
- Options: Stripe webhook in JudyBid that upserts into CommandDesk `subscribers`
  (`upsertSubscriber()` already exists and is unused), or cross-project verification.

### 2. JudyBid Grants source (in the `judybid-analyze` repo)
- The "Grants" Opportunity Source queries SAM.gov with `type=Award Notice`.
  `VEHICLE_MAP` maps Award Notice -> `Bid`, but `rankOpportunities()` then filters
  `category === 'grants'` results to vehicles containing "grant" / "nofo" /
  "notice of funding". Net effect: Grants most likely returns zero results.
- The KB currently tells customers Grants results "may be limited" and to try Federal or
  All Sources. Update the KB (and re-run `npm run sync-kb -- judybid-analyze`) once fixed.

### 3. JudyBid service-area parser (in the `judybid-analyze` repo)
- `extractProfileSignals()` matches every two-letter state abbreviation as a whole word in
  the Location / Service Area text, so ordinary words such as "in", "or", "me", "hi", "ok",
  "la", "id" are read as Indiana, Oregon, Maine, Hawaii, Oklahoma, Louisiana, Idaho. Those
  feed the state filter sent to the state/local source (first 5 abbreviations).
- The KB currently advises keeping the field short. Update the KB once fixed.

## Technical debt

### 4. `scripts/update-knowledge-base.mjs` writes to the wrong (default) Pinecone namespace
- It upserts with `index.upsert(batch)` (no `.namespace(...)`), i.e. into Pinecone's
  default namespace. CommandDesk retrieval (`src/lib/knowledge-base/retrieval.ts`) reads only
  `namespace(<product slug>)` and then `namespace('general')`, so anything this script writes
  is never retrieved.
- It also chunks differently (500 chars, no sentence boundaries) from the dashboard uploader
  (`chunker.ts`: ~1000 chars, sentence aware), and uses different IDs/metadata
  (`file` vs `filename`), and creates no Firestore `knowledge_documents` record.
- Mitigation shipped with the JudyBid change: the script now skips registry-managed
  products (currently `judybid-analyze`) and its header explains the problem.
- Recommended fix: delete it, or make it delegate to `npm run sync-kb -- <slug>`
  (`scripts/sync-product-kb.ts`, which uses the real `uploadDocument()` path).

### 5. Production knowledge base is missing for several registered products
Observed in the production Pinecone index (305 vectors before the JudyBid sync):
`careerpilot-ai` 124, `dlyn-ai` 9, `general` 172. There is **no** namespace for
`intelliscan-ai`, `nofa-ai-factory`, `commanddesk-ai` (their markdown exists under
`knowledge-base/`), or for `rfpmatch-ai`, `techsupport-ai`, `visionwing`,
`magazinify-ai`, `affiliateledger-ai`.
- Live regression showed the symptom: an IntelliScan AI question was answered from a
  generic `general` catalog chunk and the reply contradicted the repo's IntelliScan docs
  (which describe a vulnerability scanner).
- An RFPMatch AI question retrieved 0 chunks and the model produced a generic answer
  containing unverified feature claims. Consider `requireKnowledge: true` for products once
  their KB exists (the guard is already generic).
- `careerpilot-ai` (124 vectors) is a legacy namespace the classifier no longer emits
  (it maps to `dlyn-ai`, 9 vectors); decide whether to migrate or retire it.
- Fix per product: `npm run sync-kb -- <slug>` (adds only that product's namespace).
- Repo docs edited in the JudyBid change but NOT synced anywhere (their namespaces do not
  exist): `knowledge-base/nofa-ai-factory/02-products-portfolio.md` (JudyBid entry added) and
  `knowledge-base/commanddesk-ai/04-faq.md` (support address corrected).

### 6. Other items noticed
- `.env.local.example` sets `GMAIL_USER_EMAIL=support@nofabusinessconsulting.com`. That is the
  mailbox CommandDesk polls, not a reply address; confirm which inbox is actually monitored
  now that the official address is `supportdesk@nofabusinessconsulting.com`.
- The generic responder guidelines (all products) say "For billing: direct to the billing
  dashboard" and "For feature requests: ... confirm it's been logged". Only JudyBid has
  product rules that override the billing line; revisit for products without those features.
- Escalations send `product: 'judybid-analyze'` to TechSupport AI. Confirm TechSupport AI
  recognizes that product slug and has JudyBid knowledge for its L1 responses.
- JudyBid's own code still defaults `APP_URL` (Stripe success/cancel URLs) to
  `https://judybid-analyze.vercel.app`; the production domain is `https://www.judybid.com`.
  Confirm `APP_URL` is set in that project.

## Maintaining the JudyBid knowledge base
Source of truth is the `judybid-analyze` repo (KB written from commit `510b61d`) plus
approved documentation. When JudyBid pricing, limits, sources or behavior change, edit
`knowledge-base/judybid-analyze/*.md`, then run `npm run sync-kb -- judybid-analyze`
(idempotent: replaces documents with the same filename, touches only that namespace), then
`npm run test:support`.
