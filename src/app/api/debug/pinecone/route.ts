import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { verifySession } from '@/lib/firebase/session';

/**
 * Debug endpoint to test Pinecone retrieval with detailed match info
 * GET /api/debug/pinecone?query=YOUR_QUERY&product=careerpilot-ai
 */
export async function GET(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const product = searchParams.get('product') || 'careerpilot-ai';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('\n=== PINECONE DEBUG ===');
    console.log('Query:', query);
    console.log('Product:', product);

    // Initialize clients
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Query Pinecone
    const queryResponse = await index.namespace(product).query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    const matches = queryResponse.matches.map((match) => ({
      id: match.id,
      score: match.score,
      filename: match.metadata?.filename || 'unknown',
      text: match.metadata?.text || '',
      textPreview: (match.metadata?.text as string || '').substring(0, 200) + '...',
    }));

    console.log('Total matches:', matches.length);
    matches.forEach((m, i) => {
      console.log(`\nMatch ${i + 1}:`);
      console.log(`  Score: ${m.score}`);
      console.log(`  File: ${m.filename}`);
      console.log(`  ID: ${m.id}`);
      console.log(`  Text preview: ${m.textPreview}`);
    });
    console.log('=== END DEBUG ===\n');

    // Combine contexts
    const contexts = matches
      .filter((m) => m.score && m.score > 0.5)
      .map((m) => m.text)
      .join('\n\n');

    return NextResponse.json({
      query,
      product,
      totalMatches: matches.length,
      matches,
      aboveThreshold: matches.filter((m) => m.score && m.score > 0.5).length,
      combinedContext: contexts,
      contextLength: contexts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
