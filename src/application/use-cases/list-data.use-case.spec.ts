import { Test, TestingModule } from '@nestjs/testing';
import { ListDataUseCase } from './list-data.use-case';
import { DocumentRepository } from '../../domain/ports/document.repository';

describe('ListDataUseCase', () => {
  let useCase: ListDataUseCase;
  let documentRepository: DocumentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListDataUseCase,
        {
          provide: DocumentRepository,
          useValue: {
            listGrouped: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListDataUseCase>(ListDataUseCase);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should list and group data', async () => {
    const groupedData = [
      { projectId: 'proj1', contentId: 'c1', count: 10 },
      { projectId: 'proj1', contentId: 'c2', count: 5 },
      { projectId: 'proj2', contentId: 'c3', count: 8 },
    ];

    jest
      .spyOn(documentRepository, 'listGrouped')
      .mockResolvedValue(groupedData);

    const page = 1;
    const limit = 10;
    const result = await useCase.execute(page, limit);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(documentRepository.listGrouped).toHaveBeenCalledWith(
      page,
      limit,
      undefined,
      undefined,
    );

    expect(result).toHaveLength(2); // proj1, proj2
    const proj1 = result.find((p) => p.projectId === 'proj1');
    expect(proj1?.contents).toHaveLength(2);
    expect(proj1?.contents.find((c) => c.contentId === 'c1')?.items).toBe(10);
  });
});
