import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DocumentRepository } from '../../../domain/ports/document.repository';
import { Document } from '../../../domain/entities/document.entity';

@Injectable()
export class PrismaDocumentRepository implements DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveAll(documents: Document[]): Promise<void> {
    // We can't use createMany because 'embedding' is Unsupported type in Prisma Schema
    // We have to use raw queries or create individually with raw SQL for the vector
    // Or, if we use the typedSql preview feature, it might work, but let's stick to $executeRaw for safety with vectors.

    // However, inserting multiple rows with raw query can be tricky with parameters.
    // Let's loop for now or construct a bulk insert.
    // Given the "replace" requirement is handled in the UseCase (delete then insert),
    // here we just insert.

    for (const doc of documents) {
      const embeddingString = `[${doc.embedding.join(',')}]`;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore

      await this.prisma.$executeRaw`
        INSERT INTO documents (id, project_id, content_id, content, embedding)
        VALUES (${doc.id}::uuid, ${doc.projectId}, ${doc.contentId}, ${doc.content}, ${embeddingString}::vector)
      `;
    }
  }

  async deleteByProjectAndContent(
    projectId: string,
    contentId: string,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.prisma.document.deleteMany({
      where: {
        projectId,
        contentId,
      },
    });
  }

  async deleteMany(projectId?: string, contentId?: string): Promise<void> {
    if (!projectId && !contentId) {
      throw new Error(
        'At least one filter (projectId or contentId) is required for deletion',
      );
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.prisma.document.deleteMany({
      where: {
        ...(projectId && { projectId }),
        ...(contentId && { contentId }),
      },
    });
  }

  async findAll(projectId?: string, contentId?: string): Promise<Document[]> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const docs = await this.prisma.document.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(contentId && { contentId }),
      },
      select: {
        id: true,
        projectId: true,
        contentId: true,
        content: true,
        // embedding: false // Not selecting embedding to save bandwidth
      },
    });

    return docs.map(
      (doc: any) =>
        new Document(
          doc.id,

          doc.projectId,

          doc.contentId,

          doc.content,
          [],
        ),
    );
  }

  async listGrouped(
    page: number,
    limit: number,
    projectId?: string,
    contentId?: string,
  ): Promise<{ projectId: string; contentId: string; count: number }[]> {
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const groups = await this.prisma.document.groupBy({
      by: ['projectId', 'contentId'],
      _count: {
        id: true,
      },
      where: {
        ...(projectId && { projectId }),
        ...(contentId && { contentId }),
      },
      skip,
      take: limit,
      orderBy: [{ projectId: 'asc' }, { contentId: 'asc' }],
    });

    return groups.map((g: any) => ({
      projectId: g.projectId,

      contentId: g.contentId,

      count: g._count.id,
    }));
  }

  async search(
    queryEmbedding: number[],
    projectId?: string,
    contentId?: string,
    limit: number = 5,
  ): Promise<Document[]> {
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Construct WHERE clause dynamically or use optional params in raw query
    // Prisma raw query handles nulls gracefully usually, but let's be explicit.

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    const results = await this.prisma.$queryRaw<any[]>`
      SELECT id, project_id as "projectId", content_id as "contentId", content
      FROM documents
      WHERE 1=1
        AND (${projectId}::text IS NULL OR project_id = ${projectId})
        AND (${contentId}::text IS NULL OR content_id = ${contentId})
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${limit}
    `;

    // Map back to Domain Entity
    // Note: We are not returning the embedding from DB to save bandwidth/parsing as it's not strictly needed for the result

    return results.map(
      (r) =>
        new Document(
          r.id,
          r.projectId,
          r.contentId,
          r.content,
          [], // Empty embedding as we didn't fetch it
        ),
    );
  }
}
