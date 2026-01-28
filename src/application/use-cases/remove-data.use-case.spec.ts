import { Test, TestingModule } from '@nestjs/testing';
import { RemoveDataUseCase } from './remove-data.use-case';
import { DocumentRepository } from '../../domain/ports/document.repository';

describe('RemoveDataUseCase', () => {
  let useCase: RemoveDataUseCase;
  let documentRepository: DocumentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveDataUseCase,
        {
          provide: DocumentRepository,
          useValue: {
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RemoveDataUseCase>(RemoveDataUseCase);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should remove data', async () => {
    const projectId = 'proj1';
    jest.spyOn(documentRepository, 'deleteMany').mockResolvedValue(undefined);

    await useCase.execute(projectId, undefined);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(documentRepository.deleteMany).toHaveBeenCalledWith(
      projectId,
      undefined,
    );
  });

  it('should throw error if no filter provided', async () => {
    await expect(useCase.execute(undefined, undefined)).rejects.toThrow(
      'You must provide at least one filter (projectId or contentId) to remove data.',
    );
  });
});
