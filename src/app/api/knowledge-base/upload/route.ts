import { NextRequest, NextResponse } from 'next/server';
import { uploadDocument } from '@/lib/knowledge-base/uploader';
import type { KBFileType } from '@/types';

/**
 * POST /api/knowledge-base/upload
 *
 * Upload a document to the knowledge base.
 * Accepts multipart/form-data with file and product fields.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const product = formData.get('product') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validTypes: KBFileType[] = ['pdf', 'md', 'txt'];

    if (!fileExtension || !validTypes.includes(fileExtension as KBFileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: PDF, MD, TXT' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process and upload
    const result = await uploadDocument(
      product,
      file.name,
      buffer,
      fileExtension as KBFileType
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      documentId: result.documentId,
      chunkCount: result.chunkCount,
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
