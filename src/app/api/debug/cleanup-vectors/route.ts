import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Delete vectors matching a filename pattern
 * POST /api/debug/cleanup-vectors
 * Body: { product: "careerpilot-ai", filenamePattern: "02-pricing-plans.md" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product = 'careerpilot-ai', filenamePattern, dryRun = true } = body;

    if (!filenamePattern) {
      return NextResponse.json(
        { error: 'filenamePattern is required' },
        { status: 400 }
      );
    }

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Query to find matching vectors
    const results = await index.namespace(product).query({
      vector: new Array(1536).fill(0),
      topK: 100,
      includeMetadata: true,
    });

    // Filter by filename pattern
    const matchingVectors = results.matches.filter((match) => {
      const filename = match.metadata?.filename as string || '';
      return filename === filenamePattern || filename.includes(filenamePattern);
    });

    const vectorIds = matchingVectors.map((m) => m.id);

    console.log(`Found ${vectorIds.length} vectors matching pattern: ${filenamePattern}`);
    console.log('Vector IDs:', vectorIds);

    if (!dryRun && vectorIds.length > 0) {
      await index.namespace(product).deleteMany(vectorIds);
      console.log(`Deleted ${vectorIds.length} vectors`);
    }

    return NextResponse.json({
      product,
      filenamePattern,
      dryRun,
      matchingVectors: matchingVectors.length,
      vectorIds,
      message: dryRun 
        ? `DRY RUN: Would delete ${vectorIds.length} vectors. Set dryRun=false to actually delete.`
        : `Deleted ${vectorIds.length} vectors`,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
