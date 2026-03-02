import { NextRequest, NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/knowledge-base/uploader';

/**
 * DELETE /api/knowledge-base/[id]
 *
 * Delete a document from the knowledge base.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteDocument(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
