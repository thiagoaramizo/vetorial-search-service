import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

@Injectable()
export class GeminiEmbeddingAdapter implements EmbeddingProvider {
  private client: GoogleGenAI;
  private readonly targetDim = 1536;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.get<string>('GOOGLE_GENAI_API_KEY') || '',
    });
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.models.embedContent({
      model: 'gemini-embedding-001',
      contents: texts,
    });
    const embeddingsRaw = (response as any).embeddings as any[];
    const normalized = embeddingsRaw.map((item: any) => {
      const arr: number[] = Array.isArray(item) ? item : item.values;
      const len = arr.length;
      if (len === this.targetDim) return arr;
      if (len > this.targetDim) return arr.slice(0, this.targetDim);
      const padded = arr.slice();
      padded.length = this.targetDim;
      for (let i = len; i < this.targetDim; i++) padded[i] = 0;
      return padded;
    });
    return normalized;
  }
}
