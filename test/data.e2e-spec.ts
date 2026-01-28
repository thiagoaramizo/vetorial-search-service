/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/persistence/prisma/prisma.service';
import { EmbeddingProvider } from './../src/domain/ports/embedding.provider';

// Mock Implementation
class MockEmbeddingProvider implements EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]> {
    // Return a fixed vector dimension (e.g., 1536 for OpenAI compatibility in DB schema)
    // We'll create a simple deterministic vector based on string length or content hash simulation
    // to allow some "similarity" testing if needed, but mostly we just need valid vectors.

    return Promise.resolve(
      texts.map((text) => {
        // Create a vector of size 1536
        const vector = new Array(1536).fill(0);

        // Simple logic: if text contains "vetorial", put weight in first dimension
        if (text.toLowerCase().includes('vetorial')) {
          vector[0] = 1;
        } else if (text.toLowerCase().includes('mcp')) {
          vector[1] = 1;
        } else {
          vector[2] = 1;
        }

        return vector;
      }),
    );
  }
}

describe('DataController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmbeddingProvider)
      .useClass(MockEmbeddingProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.document.deleteMany();
  });

  afterAll(async () => {
    await prismaService.document.deleteMany();
    await app.close();
  });

  describe('POST /data/register', () => {
    it('should register data successfully', async () => {
      return request(app.getHttpServer())
        .post('/data/register')
        .send({
          projectId: 'e2e-project',
          contentId: 'doc-1',
          data: ['Texto sobre busca vetorial', 'Outro texto sobre MCP'],
        })
        .expect(201)
        .expect({ message: 'Data registered successfully' });
    });

    it('should fail with invalid payload', async () => {
      return request(app.getHttpServer())
        .post('/data/register')
        .send({
          projectId: '', // Invalid
          contentId: 'doc-1',
          data: [], // Empty
        })
        .expect(400);
    });
  });

  describe('POST /data/search', () => {
    beforeEach(async () => {
      // Seed data
      // We use the API to seed to test the full flow properly,
      // but since we want to test Search specifically, let's assume Register works
      // (verified by previous test) and use it to setup state.
      await request(app.getHttpServer())
        .post('/data/register')
        .send({
          projectId: 'e2e-project',
          contentId: 'doc-1',
          data: ['Texto sobre busca vetorial', 'Texto sobre nada a ver'],
        })
        .expect(201);
    });

    it('should return relevant results', async () => {
      const response = await request(app.getHttpServer())
        .post('/data/search')
        .send({
          search: 'busca vetorial',
          projectId: 'e2e-project',
          limit: 1,
        })
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].projectId).toBe('e2e-project');
      // Since our mock embedding puts 'vetorial' in index 0 for both query and doc,
      // they should match.
      expect(response.body.results[0].data).toContain(
        'Texto sobre busca vetorial',
      );
    });

    it('should filter by projectId', async () => {
      // Register data for another project
      await request(app.getHttpServer())
        .post('/data/register')
        .send({
          projectId: 'other-project',
          contentId: 'doc-2',
          data: ['Texto sobre busca vetorial também'],
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/data/search')
        .send({
          search: 'busca vetorial',
          projectId: 'e2e-project', // Should only return from e2e-project
        })
        .expect(200);

      const projects = response.body.results.map((r: any) => r.projectId);
      expect(projects).toContain('e2e-project');
      expect(projects).not.toContain('other-project');
    });
  });

  it('/data (GET) should list data filtering by projectId', async () => {
    // 1. Register data
    await request(app.getHttpServer())
      .post('/data/register')
      .send({
        projectId: 'list_proj',
        contentId: 'list_content',
        data: ['list me'],
      })
      .expect(201);

    // 2. List data
    const response = await request(app.getHttpServer())
      .get('/data')
      .query({ projectId: 'list_proj' })
      .expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.data[0].content).toBe('list me');
  });

  it('/data (DELETE) should remove data by projectId', async () => {
    // 1. Register data
    await request(app.getHttpServer())
      .post('/data/register')
      .send({
        projectId: 'del_proj',
        contentId: 'del_content',
        data: ['delete me'],
      })
      .expect(201);

    // 2. Remove data
    await request(app.getHttpServer())
      .delete('/data')
      .query({ projectId: 'del_proj' })
      .expect(200);

    // 3. Verify removal
    const response = await request(app.getHttpServer())
      .get('/data')
      .query({ projectId: 'del_proj' })
      .expect(200);

    expect(response.body.count).toBe(0);
  });
});
