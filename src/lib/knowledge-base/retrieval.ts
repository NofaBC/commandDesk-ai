import { getPineconeIndex } from '@/lib/pinecone';
import { generateEmbedding } from './embeddings';

export interface RetrievedContext {
  text: string;
  score: number;
  product: string;
  filename: string;
}

/**
 * Query knowledge base for relevant context.
 * Searches product-specific namespace first, then falls back to 'general'.
 */
export async function queryKnowledgeBase(
  product: string,
  query: string,
  topK = 5
): Promise<RetrievedContext[]> {
  try {
    const index = getPineconeIndex();
    const embedding = await generateEmbedding(query);

    // First, try product-specific namespace
    const productNamespace = product !== 'unknown' ? product : null;

    if (productNamespace) {
      const results = await index.namespace(productNamespace).query({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
      });

      if (results.matches && results.matches.length > 0) {
        return results.matches
          .filter((m) => m.score && m.score > 0.7) // Only high-confidence matches
          .map((match) => ({
            text: (match.metadata?.text as string) || '',
            score: match.score || 0,
            product: (match.metadata?.product as string) || product,
            filename: (match.metadata?.filename as string) || 'unknown',
          }));
      }
    }

    // Fallback to 'general' namespace
    const generalResults = await index.namespace('general').query({
      vector: embedding,
      topK: topK,
      includeMetadata: true,
    });

    if (generalResults.matches && generalResults.matches.length > 0) {
      return generalResults.matches
        .filter((m) => m.score && m.score > 0.7)
        .map((match) => ({
          text: (match.metadata?.text as string) || '',
          score: match.score || 0,
          product: 'general',
          filename: (match.metadata?.filename as string) || 'unknown',
        }));
    }

    return [];
  } catch (error) {
    console.error('Knowledge base query error:', error);
    return [];
  }
}

/**
 * Format retrieved context for inclusion in AI prompt.
 */
export function formatContextForPrompt(contexts: RetrievedContext[]): string {
  if (contexts.length === 0) {
    return '';
  }

  const formatted = contexts
    .map(
      (ctx, i) =>
        `[Context ${i + 1} - ${ctx.filename}]:\n${ctx.text}\n`
    )
    .join('\n');

  return `\nRelevant documentation:\n${formatted}`;
}
