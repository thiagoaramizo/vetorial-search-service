import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataController } from './interface/http/controllers/data.controller';
import { RegisterDataUseCase } from './application/use-cases/register-data.use-case';
import { SearchDataUseCase } from './application/use-cases/search-data.use-case';
import { ListDataUseCase } from './application/use-cases/list-data.use-case';
import { RemoveDataUseCase } from './application/use-cases/remove-data.use-case';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { PrismaDocumentRepository } from './infrastructure/persistence/prisma/prisma-document.repository';
import { DocumentRepository } from './domain/ports/document.repository';
import { EmbeddingProvider } from './domain/ports/embedding.provider';
import { OpenAIEmbeddingAdapter } from './infrastructure/adapters/openai-embedding.adapter';
import { GeminiEmbeddingAdapter } from './infrastructure/adapters/gemini-embedding.adapter';
import { ClaudeEmbeddingAdapter } from './infrastructure/adapters/claude-embedding.adapter';
import { MockEmbeddingAdapter } from './infrastructure/adapters/mock-embedding.adapter';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [DataController],
  providers: [
    PrismaService,
    RegisterDataUseCase,
    SearchDataUseCase,
    ListDataUseCase,
    RemoveDataUseCase,
    {
      provide: DocumentRepository,
      useClass: PrismaDocumentRepository,
    },
    OpenAIEmbeddingAdapter,
    GeminiEmbeddingAdapter,
    ClaudeEmbeddingAdapter,
    MockEmbeddingAdapter,
    {
      provide: EmbeddingProvider,
      useFactory: (
        config: ConfigService,
        openai: OpenAIEmbeddingAdapter,
        gemini: GeminiEmbeddingAdapter,
        claude: ClaudeEmbeddingAdapter,
        mock: MockEmbeddingAdapter,
      ) => {
        const provider = config.get('EMBEDDING_PROVIDER') as
          | 'gemini'
          | 'claude'
          | 'mock'
          | 'openai';
        switch (provider) {
          case 'gemini':
            return gemini;
          case 'claude':
            return claude;
          case 'mock':
            return mock;
          case 'openai':
          default:
            return openai;
        }
      },
      inject: [
        ConfigService,
        OpenAIEmbeddingAdapter,
        GeminiEmbeddingAdapter,
        ClaudeEmbeddingAdapter,
        MockEmbeddingAdapter,
      ],
    },
  ],
})
export class AppModule {}
