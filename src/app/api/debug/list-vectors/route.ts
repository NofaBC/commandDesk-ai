import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * List all unique filenames in a Pinecone namespace
 * GET /api/debug/list-vectors?product=careerpilot-ai
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product') || 'careerpilot-ai';

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Query with a zero vector to get all results
    const results = await index.namespace(product).query({
      vector: new Array(1536).fill(0),
      topK: 100,
      includeMetadata: true,
    });

    const fileGroups = results.matches.reduce((acc, match) => {
      const filename = match.metadata?.filename as string || 'unknown';
      if (!acc[filename]) {
        acc[filename] = {
          count: 0,
          ids: [],
          sampleText: '',
        };
      }
      acc[filename].count++;
      acc[filename].ids.push(match.id);
      if (acc[filename].count === 1) {
        acc[filename].sampleText = ((match.metadata?.text as string) || '').substring(0, 100);
      }
      return acc;
    }, {} as Record<string, { count: number; ids: string[]; sampleText: string }>);

    return NextResponse.json({
      product,
      totalVectors: results.matches.length,
      files: fileGroups,
      allVectorIds: results.matches.map(m => m.id),
    });
  } catch (error) {
    console.error('List vectors error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
