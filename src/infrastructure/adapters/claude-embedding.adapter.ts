import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

@Injectable()
export class ClaudeEmbeddingAdapter implements EmbeddingProvider {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.voyageai.com/v1/embeddings';
  private readonly logger = new Logger(ClaudeEmbeddingAdapter.name);

  constructor(private readonly configService: ConfigService) {
    // Anthropic recommends Voyage AI for embeddings.
    // We expect VOYAGE_API_KEY to be set for this adapter.
    this.apiKey = this.configService.get<string>('VOYAGE_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn(
        'VOYAGE_API_KEY is not set. ClaudeEmbeddingAdapter will fail if used.',
      );
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error(
        'VOYAGE_API_KEY is required for ClaudeEmbeddingAdapter (via Voyage AI)',
      );
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: 'voyage-large-2', // Compatible with 1536 dimensions (OpenAI standard)
      }),
    });

    if (!response.ok) {
      throw new Error(`Voyage AI API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    // Voyage returns data sorted by index, but let's map carefully if needed.
    // The structure is { data: [{ embedding: [...], index: 0 }, ...] }

    // Sort by index to ensure order matches input

    const sortedData = data.data.sort((a: any, b: any) => a.index - b.index);

    return sortedData.map((item: any) => item.embedding);
  }
}
