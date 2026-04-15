/**
 * Knowledge Base Update Script
 * 
 * This script reads markdown files from the knowledge-base directory,
 * chunks them, generates embeddings, and updates Pinecone vectors.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Configuration
const CHUNK_SIZE = 500; // characters per chunk
const CHUNK_OVERLAP = 50; // overlap between chunks
const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Extract product slug from file path
 * e.g., "knowledge-base/careerpilot-ai/file.md" -> "careerpilot-ai"
 */
function extractProductSlug(filePath) {
  const parts = filePath.split(/[/\\]/);
  const kbIndex = parts.indexOf('knowledge-base');
  if (kbIndex !== -1 && parts.length > kbIndex + 1) {
    return parts[kbIndex + 1];
  }
  return 'unknown';
}

/**
 * Process a single markdown file
 */
async function processFile(filePath, baseDir, openai) {
  console.log(`Processing: ${filePath}`);

  const content = readFileSync(filePath, 'utf-8');
  const productSlug = extractProductSlug(filePath);
  const relativePath = relative(baseDir, filePath);

  // Split into chunks
  const chunks = chunkText(content);
  console.log(`  Generated ${chunks.length} chunks`);

  const vectors = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkId = `${productSlug}-${relativePath}-chunk-${i}`;

    try {
      // Generate embedding
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: chunk,
      });
      const embedding = response.data[0].embedding;

      vectors.push({
        id: chunkId,
        values: embedding,
        metadata: {
          product: productSlug,
          file: relativePath,
          chunkIndex: i,
          text: chunk,
          updatedAt: new Date().toISOString(),
        },
      });

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`  Error generating embedding for chunk ${i}:`, error.message);
    }
  }

  return vectors;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting knowledge base update...\n');

  // Debug: Check if env vars are loaded
  console.log('Checking environment variables...');
  console.log('PINECONE_API_KEY exists:', !!process.env.PINECONE_API_KEY);
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME || 'commanddesk-support-kb');
  console.log('');

  // Dynamic imports after env vars are loaded
  const { Pinecone } = await import('@pinecone-database/pinecone');
  const { default: OpenAI } = await import('openai');

  // Initialize clients
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const indexName = process.env.PINECONE_INDEX_NAME || 'commanddesk-support-kb';
  const index = pinecone.index(indexName);

  // Find all markdown files
  const kbDir = join(process.cwd(), 'knowledge-base');
  const files = findMarkdownFiles(kbDir);

  console.log(`Found ${files.length} markdown files\n`);

  if (files.length === 0) {
    console.log('No markdown files found. Exiting.');
    return;
  }

  // Process each file
  const allVectors = [];

  for (const file of files) {
    const vectors = await processFile(file, kbDir, openai);
    allVectors.push(...vectors);
  }

  console.log(`\nGenerated ${allVectors.length} total vectors`);

  // Upsert to Pinecone in batches
  const BATCH_SIZE = 100;
  console.log(`\nUpserting to Pinecone in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < allVectors.length; i += BATCH_SIZE) {
    const batch = allVectors.slice(i, i + BATCH_SIZE);
    await index.upsert(batch);
    console.log(`  Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allVectors.length / BATCH_SIZE)}`);
  }

  console.log('\n✓ Knowledge base update complete!');
}

// Run the script
main().catch((error) => {
  console.error('Error updating knowledge base:', error);
  process.exit(1);
});
