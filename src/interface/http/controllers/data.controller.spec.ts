import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './data.controller';
import { RegisterDataUseCase } from '../../../application/use-cases/register-data.use-case';
import { SearchDataUseCase } from '../../../application/use-cases/search-data.use-case';
import { ListDataUseCase } from '../../../application/use-cases/list-data.use-case';
import { RemoveDataUseCase } from '../../../application/use-cases/remove-data.use-case';
import { RegisterDataDto } from '../dtos/register-data.dto';
import { SearchDataDto } from '../dtos/search-data.dto';
import { ListDataDto } from '../dtos/list-data.dto';
import { RemoveDataDto } from '../dtos/remove-data.dto';

describe('DataController', () => {
  let controller: DataController;
  let registerDataUseCase: RegisterDataUseCase;
  let searchDataUseCase: SearchDataUseCase;
  let listDataUseCase: ListDataUseCase;
  let removeDataUseCase: RemoveDataUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        {
          provide: RegisterDataUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: SearchDataUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListDataUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RemoveDataUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DataController>(DataController);
    registerDataUseCase = module.get<RegisterDataUseCase>(RegisterDataUseCase);
    searchDataUseCase = module.get<SearchDataUseCase>(SearchDataUseCase);
    listDataUseCase = module.get<ListDataUseCase>(ListDataUseCase);
    removeDataUseCase = module.get<RemoveDataUseCase>(RemoveDataUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register data', async () => {
    const dto: RegisterDataDto = {
      projectId: 'p1',
      contentId: 'c1',
      data: ['text'],
    };

    jest.spyOn(registerDataUseCase, 'execute').mockResolvedValue(undefined);

    const result = await controller.register(dto);

    expect(result).toEqual({ message: 'Data registered successfully' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(registerDataUseCase.execute).toHaveBeenCalledWith(
      dto.projectId,
      dto.contentId,
      dto.data,
    );
  });

  it('should search data', async () => {
    const dto: SearchDataDto = {
      search: 'query',
      limit: 5,
    };
    const expectedResult = [
      { projectId: 'p1', contentId: 'c1', data: ['text'] },
    ];

    jest.spyOn(searchDataUseCase, 'execute').mockResolvedValue(expectedResult);

    const result = await controller.search(dto);

    expect(result).toEqual({ results: expectedResult });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(searchDataUseCase.execute).toHaveBeenCalledWith(
      dto.search,
      undefined,
      undefined,
      5,
    );
  });

  it('should list data', async () => {
    const dto: ListDataDto = {
      page: 1,
      limit: 10,
    };
    const expectedResult = [
      { projectId: 'p1', contents: [{ contentId: 'c1', items: 5 }] },
    ];

    jest.spyOn(listDataUseCase, 'execute').mockResolvedValue(expectedResult);

    const result = await controller.list(dto);

    expect(result).toEqual({
      results: expectedResult,
      page: 1,
      limit: 10,
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(listDataUseCase.execute).toHaveBeenCalledWith(
      1,
      10,
      undefined,
      undefined,
    );
  });

  it('should remove data', async () => {
    const dto: RemoveDataDto = {
      projectId: 'p1',
    };

    jest.spyOn(removeDataUseCase, 'execute').mockResolvedValue(undefined);

    const result = await controller.remove(dto);

    expect(result).toEqual({ message: 'Data removed successfully' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(removeDataUseCase.execute).toHaveBeenCalledWith(
      dto.projectId,
      undefined,
    );
  });
});
