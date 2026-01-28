import { Injectable } from '@nestjs/common';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

@Injectable()
export class MockEmbeddingAdapter implements EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]> {
    return Promise.resolve(
      texts.map((text) => {
        // Create a vector of size 1536 (OpenAI compatible)

        const vector: number[] = new Array(1536).fill(0);

        // Simple deterministic logic for testing similarity
        const lowerText = text.toLowerCase();
        if (lowerText.includes('vetorial') || lowerText.includes('vector')) {
          vector[0] = 0.9;
          vector[1] = 0.1;
        } else if (
          lowerText.includes('mcp') ||
          lowerText.includes('protocol')
        ) {
          vector[0] = 0.1;
          vector[1] = 0.9;
        } else if (lowerText.includes('nest') || lowerText.includes('node')) {
          vector[2] = 0.9;
        } else {
          // Random-ish but deterministic based on length
          vector[3] = (text.length % 10) / 10;
        }

        return vector;
      }),
    );
  }
}
