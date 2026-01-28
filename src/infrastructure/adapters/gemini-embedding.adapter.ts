import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

@Injectable()
export class GeminiEmbeddingAdapter implements EmbeddingProvider {
  private client: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new GoogleGenerativeAI(
      this.configService.get<string>('GOOGLE_GENAI_API_KEY') || '',
    );
  }

  async embed(texts: string[]): Promise<number[][]> {
    const model = this.client.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text: texts[0] }] },
    });

    const embedding = result.embedding;
    return [embedding.values];
  }
}
