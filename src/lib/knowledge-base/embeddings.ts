import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate embedding for a text chunk using OpenAI.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batch.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const embeddings: number[][] = [];

  // Process in batches of 100 (OpenAI limit)
  const batchSize = 100;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
    });

    embeddings.push(...response.data.map((d) => d.embedding));
  }

  return embeddings;
}
