import { Pinecone } from '@pinecone-database/pinecone';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local if it exists
let PINECONE_API_KEY = process.env.PINECONE_API_KEY;
let PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

const envPath = join(__dirname, '..', '.env.local');
if (!PINECONE_API_KEY && existsSync(envPath)) {
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (key === 'PINECONE_API_KEY') PINECONE_API_KEY = value;
          if (key === 'PINECONE_INDEX_NAME') PINECONE_INDEX_NAME = value;
        }
      }
    });
  } catch (e) {
    console.error('Warning: Could not read .env.local:', e.message);
  }
}

if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
  console.error('\nError: Missing Pinecone credentials');
  console.error('Set PINECONE_API_KEY and PINECONE_INDEX_NAME environment variables or add them to .env.local\n');
  process.exit(1);
}

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

async function listVectors(product = 'careerpilot-ai') {
  console.log(`\n📋 Listing vectors in namespace: ${product}\n`);

  const results = await index.namespace(product).query({
    vector: new Array(1536).fill(0),
    topK: 100,
    includeMetadata: true,
  });

  const fileGroups = {};
  
  results.matches.forEach((match) => {
    const filename = match.metadata?.filename || 'unknown';
    if (!fileGroups[filename]) {
      fileGroups[filename] = {
        count: 0,
        ids: [],
        sampleText: '',
      };
    }
    fileGroups[filename].count++;
    fileGroups[filename].ids.push(match.id);
    if (fileGroups[filename].count === 1) {
      fileGroups[filename].sampleText = (match.metadata?.text || '').substring(0, 80);
    }
  });

  console.log(`Total vectors: ${results.matches.length}\n`);
  
  Object.entries(fileGroups).forEach(([filename, data]) => {
    const isOld = !filename.includes('knowledge-base-careerpilot-ai');
    const marker = isOld ? '❌ OLD' : '✅ KEEP';
    console.log(`${marker} ${filename}`);
    console.log(`   Chunks: ${data.count}`);
    console.log(`   Sample: ${data.sampleText}...`);
    console.log('');
  });

  return fileGroups;
}

async function deleteByFilename(product, filenamePattern, dryRun = true) {
  console.log(`\n🗑️  ${dryRun ? 'DRY RUN:' : 'DELETING:'} ${filenamePattern}\n`);

  const results = await index.namespace(product).query({
    vector: new Array(1536).fill(0),
    topK: 100,
    includeMetadata: true,
  });

  const matchingVectors = results.matches.filter((match) => {
    const filename = match.metadata?.filename || '';
    return filename === filenamePattern || filename.includes(filenamePattern);
  });

  const vectorIds = matchingVectors.map((m) => m.id);

  console.log(`Found ${vectorIds.length} vectors matching pattern: ${filenamePattern}`);

  if (vectorIds.length === 0) {
    console.log('No vectors found.');
    return;
  }

  if (dryRun) {
    console.log('\n⚠️  DRY RUN - Nothing deleted. Run with --delete to actually delete.');
    console.log(`Vector IDs that would be deleted:`);
    vectorIds.forEach(id => console.log(`  - ${id}`));
  } else {
    await index.namespace(product).deleteMany(vectorIds);
    console.log(`✅ Deleted ${vectorIds.length} vectors`);
  }
}

async function deleteAllOldFiles(product = 'careerpilot-ai', dryRun = true) {
  console.log(`\n🧹 Cleaning up old files in namespace: ${product}\n`);

  const results = await index.namespace(product).query({
    vector: new Array(1536).fill(0),
    topK: 100,
    includeMetadata: true,
  });

  // Find all files WITHOUT the correct prefix
  const oldVectors = results.matches.filter((match) => {
    const filename = match.metadata?.filename || '';
    return !filename.includes('knowledge-base-careerpilot-ai') && filename !== 'unknown';
  });

  const vectorIds = oldVectors.map((m) => m.id);

  // Group by filename for display
  const fileGroups = {};
  oldVectors.forEach((match) => {
    const filename = match.metadata?.filename || 'unknown';
    if (!fileGroups[filename]) {
      fileGroups[filename] = 0;
    }
    fileGroups[filename]++;
  });

  console.log(`Found ${vectorIds.length} old vectors to delete:\n`);
  Object.entries(fileGroups).forEach(([filename, count]) => {
    console.log(`  ❌ ${filename} (${count} chunks)`);
  });

  if (vectorIds.length === 0) {
    console.log('✅ No old vectors found. All clean!');
    return;
  }

  if (dryRun) {
    console.log('\n⚠️  DRY RUN - Nothing deleted. Run with --delete-all to actually delete.');
  } else {
    await index.namespace(product).deleteMany(vectorIds);
    console.log(`\n✅ Deleted ${vectorIds.length} vectors`);
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];
const product = 'careerpilot-ai';

try {
  if (command === 'list') {
    await listVectors(product);
  } else if (command === 'delete') {
    const pattern = args[1];
    const reallyDelete = args.includes('--confirm');
    if (!pattern) {
      console.log('Usage: node cleanup-vectors.mjs delete <pattern> [--confirm]');
      process.exit(1);
    }
    await deleteByFilename(product, pattern, !reallyDelete);
  } else if (command === 'delete-all') {
    const reallyDelete = args.includes('--confirm');
    await deleteAllOldFiles(product, !reallyDelete);
  } else {
    console.log(`
CommandDesk AI - Vector Cleanup Tool

Usage:
  node scripts/cleanup-vectors.mjs list
    - List all vectors and identify old files

  node scripts/cleanup-vectors.mjs delete <filename>
    - Dry run: preview deletion of specific file

  node scripts/cleanup-vectors.mjs delete <filename> --confirm
    - Actually delete specific file

  node scripts/cleanup-vectors.mjs delete-all
    - Dry run: preview deletion of all old files

  node scripts/cleanup-vectors.mjs delete-all --confirm
    - Actually delete all old files (recommended!)
    `);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
