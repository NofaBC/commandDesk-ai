/**
 * READ-ONLY report of knowledge-base state: Pinecone vectors per namespace and a
 * fingerprint of the Firestore `knowledge_documents` per product. Run before and
 * after a KB sync and compare the JSON to prove which namespaces changed.
 *
 *   npx tsx --env-file=.env.local scripts/kb-namespace-report.ts <output.json>
 *   npx tsx scripts/kb-namespace-report.ts --compare <before.json> <after.json>
 *
 * Prints only namespace names, counts and hashes - never credentials or content.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

interface Snapshot {
  takenAt: string;
  pineconeTotal: number;
  pineconeNamespaces: Record<string, number>;
  firestoreByProduct: Record<string, { documents: number; chunks: number; fingerprint: string }>;
}

async function snapshot(): Promise<Snapshot> {
  const { getPineconeIndex } = await import('../src/lib/pinecone');
  const { adminDb } = await import('../src/lib/firebase/admin');

  const stats = await getPineconeIndex().describeIndexStats();
  const pineconeNamespaces: Record<string, number> = {};
  for (const [ns, v] of Object.entries(stats.namespaces ?? {})) {
    pineconeNamespaces[ns || '(default)'] = v.recordCount ?? 0;
  }

  const snap = await adminDb().collection('knowledge_documents').get();
  const grouped: Record<string, string[]> = {};
  const chunks: Record<string, number> = {};
  for (const d of snap.docs) {
    const x = d.data();
    const product = x.product ?? '(none)';
    const updated = x.updatedAt?.toDate?.()?.toISOString?.() ?? String(x.updatedAt);
    (grouped[product] ||= []).push(
      `${d.id}|${x.filename}|${x.status}|${x.chunkCount}|${updated}`
    );
    chunks[product] = (chunks[product] ?? 0) + (x.chunkCount ?? 0);
  }
  const firestoreByProduct: Snapshot['firestoreByProduct'] = {};
  for (const [p, rows] of Object.entries(grouped)) {
    firestoreByProduct[p] = {
      documents: rows.length,
      chunks: chunks[p] ?? 0,
      fingerprint: createHash('sha256').update(rows.sort().join('\n')).digest('hex').slice(0, 16),
    };
  }

  return {
    takenAt: new Date().toISOString(),
    pineconeTotal: stats.totalRecordCount ?? 0,
    pineconeNamespaces,
    firestoreByProduct,
  };
}

function compare(beforePath: string, afterPath: string) {
  const a: Snapshot = JSON.parse(readFileSync(beforePath, 'utf-8'));
  const b: Snapshot = JSON.parse(readFileSync(afterPath, 'utf-8'));
  let changed = 0;

  console.log('Pinecone namespaces (vector count before -> after):');
  for (const ns of [...new Set([...Object.keys(a.pineconeNamespaces), ...Object.keys(b.pineconeNamespaces)])].sort()) {
    const x = a.pineconeNamespaces[ns];
    const y = b.pineconeNamespaces[ns];
    const same = x === y;
    if (!same) changed++;
    console.log(`  ${same ? 'unchanged' : 'CHANGED  '}  ${ns.padEnd(22)} ${x ?? '(absent)'} -> ${y ?? '(absent)'}`);
  }

  console.log('\nFirestore knowledge_documents by product (docs/chunks, fingerprint):');
  for (const p of [...new Set([...Object.keys(a.firestoreByProduct), ...Object.keys(b.firestoreByProduct)])].sort()) {
    const x = a.firestoreByProduct[p];
    const y = b.firestoreByProduct[p];
    const same = !!x && !!y && x.fingerprint === y.fingerprint;
    if (!same) changed++;
    const fmt = (v?: Snapshot['firestoreByProduct'][string]) => (v ? `${v.documents}/${v.chunks} [${v.fingerprint}]` : '(absent)');
    console.log(`  ${same ? 'unchanged' : 'CHANGED  '}  ${p.padEnd(22)} ${fmt(x)} -> ${fmt(y)}`);
  }
  console.log(`\n${changed} item(s) changed`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--compare') {
    compare(args[1], args[2]);
    return;
  }
  const out = args[0];
  const s = await snapshot();
  if (out) writeFileSync(out, JSON.stringify(s, null, 2));
  console.log(`Pinecone total vectors: ${s.pineconeTotal}`);
  for (const [ns, n] of Object.entries(s.pineconeNamespaces).sort()) console.log(`  ns ${ns.padEnd(22)} ${n}`);
  for (const [p, v] of Object.entries(s.firestoreByProduct).sort())
    console.log(`  fs ${p.padEnd(22)} docs=${v.documents} chunks=${v.chunks} fp=${v.fingerprint}`);
}

main().catch((e) => {
  console.error('kb-namespace-report failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});
