import { Injectable, Inject } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';
import { Document } from '../../domain/entities/document.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegisterDataUseCase {
  constructor(
    @Inject(DocumentRepository)
    private readonly documentRepository: DocumentRepository,
    @Inject(EmbeddingProvider)
    private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async execute(
    projectId: string,
    contentId: string,
    data: string[],
  ): Promise<void> {
    // 1. Generate embeddings
    const embeddings = await this.embeddingProvider.embed(data);

    if (embeddings.length !== data.length) {
      throw new Error('Mismatch between data and embeddings count');
    }

    // 2. Delete existing data for this project/content
    await this.documentRepository.deleteByProjectAndContent(
      projectId,
      contentId,
    );

    // 3. Create new documents
    const documents = data.map((text, index) => {
      return new Document(
        uuidv4(),
        projectId,
        contentId,
        text,
        embeddings[index],
      );
    });

    // 4. Persist
    await this.documentRepository.saveAll(documents);
  }
}
