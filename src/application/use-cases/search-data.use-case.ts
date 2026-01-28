import { Injectable, Inject } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

export interface SearchResult {
  projectId: string;
  contentId: string;
  data: string[];
}

@Injectable()
export class SearchDataUseCase {
  constructor(
    @Inject(DocumentRepository)
    private readonly documentRepository: DocumentRepository,
    @Inject(EmbeddingProvider)
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async execute(
    search: string,
    projectId?: string,
    contentId?: string,
    limit: number = 5,
  ): Promise<SearchResult[]> {
    // 1. Convert search query to embedding
    const [queryEmbedding] = await this.embeddingProvider.embed([search]);

    if (!queryEmbedding) {
      throw new Error('Failed to generate embedding for search query');
    }

    // 2. Search in repository
    const documents = await this.documentRepository.search(
      queryEmbedding,
      projectId,
      contentId,
      limit,
    );

    // 3. Group results by projectId + contentId
    const groupedResults = new Map<string, SearchResult>();

    for (const doc of documents) {
      const key = `${doc.projectId}:${doc.contentId}`;

      if (!groupedResults.has(key)) {
        groupedResults.set(key, {
          projectId: doc.projectId,
          contentId: doc.contentId,
          data: [],
        });
      }

      groupedResults.get(key)!.data.push(doc.content);
    }

    return Array.from(groupedResults.values());
  }
}
