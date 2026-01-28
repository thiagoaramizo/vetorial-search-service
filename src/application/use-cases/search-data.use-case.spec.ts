import { Test, TestingModule } from '@nestjs/testing';
import { SearchDataUseCase } from './search-data.use-case';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';
import { Document } from '../../domain/entities/document.entity';

describe('SearchDataUseCase', () => {
  let useCase: SearchDataUseCase;
  let documentRepository: DocumentRepository;
  let embeddingProvider: EmbeddingProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchDataUseCase,
        {
          provide: DocumentRepository,
          useValue: {
            search: jest.fn(),
          },
        },
        {
          provide: EmbeddingProvider,
          useValue: {
            embed: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<SearchDataUseCase>(SearchDataUseCase);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    embeddingProvider = module.get<EmbeddingProvider>(EmbeddingProvider);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should search and return grouped results', async () => {
    const searchText = 'query';
    const queryEmbedding = [0.1, 0.2];
    const documents = [
      new Document('id1', 'proj1', 'content1', 'text1', []),
      new Document('id2', 'proj1', 'content1', 'text2', []),
      new Document('id3', 'proj2', 'content2', 'text3', []),
    ];

    jest.spyOn(embeddingProvider, 'embed').mockResolvedValue([queryEmbedding]);
    jest.spyOn(documentRepository, 'search').mockResolvedValue(documents);

    const result = await useCase.execute(searchText);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(embeddingProvider.embed).toHaveBeenCalledWith([searchText]);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(documentRepository.search).toHaveBeenCalledWith(
      queryEmbedding,
      undefined,
      undefined,
      5,
    );

    expect(result).toHaveLength(2); // 2 groups
    expect(result.find((r) => r.projectId === 'proj1')?.data).toHaveLength(2);
    expect(result.find((r) => r.projectId === 'proj2')?.data).toHaveLength(1);
  });

  it('should throw error if embedding fails', async () => {
    jest.spyOn(embeddingProvider, 'embed').mockResolvedValue([]);

    await expect(useCase.execute('query')).rejects.toThrow(
      'Failed to generate embedding for search query',
    );
  });
});
