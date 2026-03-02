export interface TextChunk {
  text: string;
  index: number;
}

/**
 * Split text into chunks with overlap for better context preservation.
 */
export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): TextChunk[] {
  const chunks: TextChunk[] = [];
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
      });
      chunkIndex++;

      // Keep overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
    });
  }

  return chunks;
}

/**
 * Extract text from different file formats.
 */
export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  if (fileType === 'txt' || fileType === 'md') {
    return buffer.toString('utf-8');
  }

  if (fileType === 'pdf') {
    // Dynamic import to avoid build issues
    const pdfParse = await import('pdf-parse');
    // Handle both ESM and CJS exports
    const parser = (pdfParse as any).default || pdfParse;
    const data = await parser(buffer);
    return data.text;
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}
