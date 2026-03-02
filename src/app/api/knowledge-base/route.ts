import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, getDocumentsByProduct } from '@/lib/knowledge-base/uploader';

/**
 * GET /api/knowledge-base
 * GET /api/knowledge-base?product=careerpilot-ai
 *
 * List all knowledge base documents, optionally filtered by product.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get('product');

    const documents = product
      ? await getDocumentsByProduct(product)
      : await getAllDocuments();

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
