import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

@Injectable()
export class OpenAIEmbeddingAdapter implements EmbeddingProvider {
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }
}
