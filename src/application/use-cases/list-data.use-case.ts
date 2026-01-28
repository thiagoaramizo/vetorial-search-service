import { Inject, Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';

export interface ProjectStats {
  projectId: string;
  contents: ContentStats[];
}

export interface ContentStats {
  contentId: string;
  items: number;
}

@Injectable()
export class ListDataUseCase {
  constructor(
    @Inject(DocumentRepository)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(
    page: number,
    limit: number,
    projectId?: string,
    contentId?: string,
  ): Promise<ProjectStats[]> {
    const groupedData = await this.documentRepository.listGrouped(
      page,
      limit,
      projectId,
      contentId,
    );

    // Transform flat list to nested structure
    const projectMap = new Map<string, ProjectStats>();

    for (const item of groupedData) {
      if (!projectMap.has(item.projectId)) {
        projectMap.set(item.projectId, {
          projectId: item.projectId,
          contents: [],
        });
      }
      projectMap.get(item.projectId)?.contents.push({
        contentId: item.contentId,
        items: item.count,
      });
    }

    return Array.from(projectMap.values());
  }
}
