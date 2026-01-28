import { Test, TestingModule } from '@nestjs/testing';
import { RegisterDataUseCase } from './register-data.use-case';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { EmbeddingProvider } from '../../domain/ports/embedding.provider';

describe('RegisterDataUseCase', () => {
  let useCase: RegisterDataUseCase;
  let documentRepository: DocumentRepository;
  let embeddingProvider: EmbeddingProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterDataUseCase,
        {
          provide: DocumentRepository,
          useValue: {
            deleteByProjectAndContent: jest.fn(),
            saveAll: jest.fn(),
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

    useCase = module.get<RegisterDataUseCase>(RegisterDataUseCase);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    embeddingProvider = module.get<EmbeddingProvider>(EmbeddingProvider);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should register data successfully', async () => {
    const projectId = 'proj-1';
    const contentId = 'content-1';
    const data = ['text1', 'text2'];
    const embeddings = [
      [0.1, 0.2],
      [0.3, 0.4],
    ];

    jest.spyOn(embeddingProvider, 'embed').mockResolvedValue(embeddings);
    jest
      .spyOn(documentRepository, 'deleteByProjectAndContent')
      .mockResolvedValue(undefined);
    jest.spyOn(documentRepository, 'saveAll').mockResolvedValue(undefined);

    await useCase.execute(projectId, contentId, data);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(embeddingProvider.embed).toHaveBeenCalledWith(data);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(documentRepository.deleteByProjectAndContent).toHaveBeenCalledWith(
      projectId,
      contentId,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(documentRepository.saveAll).toHaveBeenCalledTimes(1);
  });

  it('should throw error if embeddings count mismatch', async () => {
    const projectId = 'proj-1';
    const contentId = 'content-1';
    const data = ['text1', 'text2'];
    const embeddings = [[0.1, 0.2]]; // Mismatch

    jest.spyOn(embeddingProvider, 'embed').mockResolvedValue(embeddings);

    await expect(useCase.execute(projectId, contentId, data)).rejects.toThrow(
      'Mismatch between data and embeddings count',
    );
  });
});
