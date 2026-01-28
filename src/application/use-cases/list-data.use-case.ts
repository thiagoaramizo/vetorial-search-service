import { Inject, Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { Document } from '../../domain/entities/document.entity';

@Injectable()
export class ListDataUseCase {
  constructor(
    @Inject(DocumentRepository)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(projectId?: string, contentId?: string): Promise<Document[]> {
    return this.documentRepository.findAll(projectId, contentId);
  }
}
