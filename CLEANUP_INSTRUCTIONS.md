# Vector Cleanup Instructions

## Problem
The Pinecone knowledge base has OLD incorrect files alongside the NEW correct files:

**OLD files** (WRONG - need to delete):
- `01-product-overview.md`
- `02-pricing-plans.md` (shows Starter $29, Pro $79, LinkedIn optimization)
- `03-features-guide.md`
- `04-getting-started.md`
- `05-faq.md`

**NEW files** (CORRECT - keep these):
- `knowledge-base-careerpilot-ai-01-product-overview.md`
- `knowledge-base-careerpilot-ai-02-pricing-plans.md` (shows Starter $39/500, Pro $99/1,200)
- `knowledge-base-careerpilot-ai-03-features-guide.md`
- `knowledge-base-careerpilot-ai-04-getting-started.md`
- `knowledge-base-careerpilot-ai-05-faq.md`

## Solution: Delete OLD files via Pinecone Dashboard

1. Go to https://app.pinecone.io
2. Select your index (likely `commanddesk-ai`)
3. Go to the `careerpilot-ai` namespace
4. Find and delete ALL records with filenames that DON'T have the `knowledge-base-careerpilot-ai-` prefix

### Files to DELETE:
Search for and delete all vectors with these metadata filenames:
- `01-product-overview.md`
- `02-pricing-plans.md`
- `03-features-guide.md`
- `04-getting-started.md`
- `05-faq.md`

You can use the Pinecone dashboard's filter/search to find vectors by metadata.filename.

## Alternative: Use the cleanup script (requires Pinecone credentials locally)

If you add your Pinecone credentials to `.env.local`:

```bash
# Add to .env.local
PINECONE_API_KEY=your-api-key-here
PINECONE_INDEX_NAME=your-index-name-here
```

Then run:

```bash
# List all vectors
node scripts/cleanup-vectors.mjs list

# Preview deletion
node scripts/cleanup-vectors.mjs delete-all

# Actually delete all old files
node scripts/cleanup-vectors.mjs delete-all --confirm
```

## After Cleanup

Test the AI responses again. It should now return:
- Starter Plan: $39/month, 500 credits
- Pro Plan: $99/month, 1,200 credits
- LinkedIn optimization: "Not in the current launch support scope"
