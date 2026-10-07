/**
 * Sync a product's knowledge-base folder into CommandDesk (Firestore + Pinecone).
 *
 * Reuses the exact code path of the dashboard uploader (uploadDocument /
 * deleteDocument), so vectors land in the product's own Pinecone namespace
 * (namespace == registry slug) and documents show up in the dashboard.
 *
 * Idempotent: any existing document for the same product + filename is deleted
 * before the new version is uploaded. Other products/namespaces are never touched.
 *
 * Usage:
 *   npm run sync-kb -- judybid-analyze            # sync knowledge-base/judybid-analyze/*.md
 *   npm run sync-kb -- judybid-analyze --dry-run  # show files/chunks only (no network writes)
 *
 * Requires .env.local with OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME
 * and the Firebase admin credentials (not needed for --dry-run).
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getProduct } from '../src/lib/products/registry';
import { chunkText } from '../src/lib/knowledge-base/chunker';

async function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');

  if (!slug) {
    console.error('Usage: npm run sync-kb -- <product-slug> [--dry-run]');
    process.exit(1);
  }

  const product = getProduct(slug);
  if (!product) {
    console.error(
      `Unknown product slug "${slug}". Add it to src/lib/products/registry.ts first.`
    );
    process.exit(1);
  }

  const dir = join(process.cwd(), 'knowledge-base', product.slug);
  if (!existsSync(dir)) {
    console.error(`No knowledge-base folder found: ${dir}`);
    process.exit(1);
  }

  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  if (files.length === 0) {
    console.error(`No .md files in ${dir}`);
    process.exit(1);
  }

  console.log(
    `${dryRun ? '[dry run] ' : ''}Syncing ${files.length} file(s) for ${product.name} (namespace: ${product.slug})\n`
  );

  if (dryRun) {
    for (const file of files) {
      const text = readFileSync(join(dir, file), 'utf-8');
      console.log(`  ${file}: ${text.length} chars -> ${chunkText(text).length} chunks`);
    }
    return;
  }

  // Imported lazily so --dry-run works without credentials.
  const { uploadDocument, deleteDocument, getDocumentsByProduct, getAllDocuments } =
    await import('../src/lib/knowledge-base/uploader');

  let existing;
  try {
    existing = await getDocumentsByProduct(product.slug);
  } catch {
    // Composite index may be missing; fall back to a filtered scan.
    existing = (await getAllDocuments()).filter((d) => d.product === product.slug);
  }

  let failures = 0;
  for (const file of files) {
    for (const old of existing.filter((d) => d.filename === file)) {
      const ok = await deleteDocument(old.id);
      console.log(`  removed previous version of ${file} (${old.id}): ${ok ? 'ok' : 'FAILED'}`);
    }

    const buffer = readFileSync(join(dir, file));
    const result = await uploadDocument(product.slug, file, buffer, 'md');
    if (result.success) {
      console.log(`  uploaded ${file}: ${result.chunkCount} chunks (doc ${result.documentId})`);
    } else {
      failures++;
      console.error(`  FAILED ${file}: ${result.error}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} file(s) failed.`);
    process.exit(1);
  }
  console.log('\nKnowledge base sync complete.');
}

main().catch((error) => {
  console.error('sync-kb failed:', error);
  process.exit(1);
});
