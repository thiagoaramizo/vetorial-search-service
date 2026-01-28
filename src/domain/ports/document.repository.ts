import { Document } from '../entities/document.entity';

export interface DocumentRepository {
  saveAll(documents: Document[]): Promise<void>;
  deleteByProjectAndContent(
    projectId: string,
    contentId: string,
  ): Promise<void>;
  deleteMany(projectId?: string, contentId?: string): Promise<void>;
  findAll(projectId?: string, contentId?: string): Promise<Document[]>;
  listGrouped(
    page: number,
    limit: number,
    projectId?: string,
    contentId?: string,
  ): Promise<{ projectId: string; contentId: string; count: number }[]>;
  search(
    queryEmbedding: number[],
    projectId?: string,
    contentId?: string,
    limit?: number,
  ): Promise<Document[]>;
}
export const DocumentRepository = Symbol('DocumentRepository');
