import { getPineconeIndex } from '@/lib/pinecone';
import { chunkText, extractText } from './chunker';
import { generateEmbeddings } from './embeddings';
import { adminDb } from '@/lib/firebase/admin';
import type { KBDocument, KBFileType } from '@/types';

export interface UploadResult {
  documentId: string;
  chunkCount: number;
  success: boolean;
  error?: string;
}

/**
 * Process and upload a document to the knowledge base.
 */
export async function uploadDocument(
  product: string,
  filename: string,
  fileBuffer: Buffer,
  fileType: KBFileType
): Promise<UploadResult> {
  const db = adminDb();
  
  try {
    // Create document record in Firestore
    const docRef = await db.collection('knowledge_documents').add({
      product,
      filename,
      fileType,
      fileSize: fileBuffer.length,
      status: 'processing',
      chunkCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const documentId = docRef.id;

    try {
      // Extract text from file
      const text = await extractText(fileBuffer, fileType);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content extracted from file');
      }

      // Split into chunks
      const chunks = chunkText(text);

      if (chunks.length === 0) {
        throw new Error('No chunks generated from text');
      }

      // Generate embeddings for all chunks
      const embeddings = await generateEmbeddings(chunks.map((c) => c.text));

      // Store in Pinecone
      const index = getPineconeIndex();
      const namespace = index.namespace(product);

      const vectors = chunks.map((chunk, i) => ({
        id: `${documentId}-chunk-${chunk.index}`,
        values: embeddings[i],
        metadata: {
          documentId,
          product,
          filename,
          chunkIndex: chunk.index,
          text: chunk.text,
        },
      }));

      // Upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await namespace.upsert({ records: batch });
      }

      // Update document status in Firestore
      await docRef.update({
        status: 'embedded',
        chunkCount: chunks.length,
        updatedAt: new Date(),
      });

      return {
        documentId,
        chunkCount: chunks.length,
        success: true,
      };
    } catch (error) {
      // Update document with error status
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await docRef.update({
        status: 'error',
        errorMessage,
        updatedAt: new Date(),
      });

      throw error;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to upload document';
    console.error('Document upload error:', errorMessage);

    return {
      documentId: '',
      chunkCount: 0,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete a document from knowledge base.
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const db = adminDb();
    const docRef = db.collection('knowledge_documents').doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Document not found');
    }

    const data = doc.data() as KBDocument;

    // Delete vectors from Pinecone (only if chunks were successfully created)
    if (data.chunkCount > 0 && data.status === 'embedded') {
      try {
        const index = getPineconeIndex();
        const namespace = index.namespace(data.product);

        // Delete all chunks for this document
        const vectorIds: string[] = [];
        for (let i = 0; i < data.chunkCount; i++) {
          vectorIds.push(`${documentId}-chunk-${i}`);
        }

        await namespace.deleteMany(vectorIds);
      } catch (pineconeError) {
        // Log but don't fail if Pinecone deletion fails
        console.warn(`Pinecone deletion failed for ${documentId}:`, pineconeError);
        // Continue to delete Firestore record anyway
      }
    }

    // Delete Firestore record (always delete, even if Pinecone failed)
    await docRef.delete();

    return true;
  } catch (error) {
    console.error('Document deletion error:', error);
    return false;
  }
}

/**
 * Get all documents for a product.
 */
export async function getDocumentsByProduct(
  product: string
): Promise<KBDocument[]> {
  const db = adminDb();
  const snapshot = await db
    .collection('knowledge_documents')
    .where('product', '==', product)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as KBDocument;
  });
}

/**
 * Get all documents across all products.
 */
export async function getAllDocuments(): Promise<KBDocument[]> {
  const db = adminDb();
  const snapshot = await db
    .collection('knowledge_documents')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
    } as KBDocument;
  });
}
