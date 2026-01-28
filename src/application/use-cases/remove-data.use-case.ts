import { Inject, Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';

@Injectable()
export class RemoveDataUseCase {
  constructor(
    @Inject(DocumentRepository)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(projectId?: string, contentId?: string): Promise<void> {
    if (!projectId && !contentId) {
      throw new Error(
        'You must provide at least one filter (projectId or contentId) to remove data.',
      );
    }
    await this.documentRepository.deleteMany(projectId, contentId);
  }
}
