import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterDataUseCase } from '../../../application/use-cases/register-data.use-case';
import { SearchDataUseCase } from '../../../application/use-cases/search-data.use-case';
import { RegisterDataDto } from '../dtos/register-data.dto';
import { SearchDataDto } from '../dtos/search-data.dto';

@Controller('data')
export class DataController {
  constructor(
    private readonly registerDataUseCase: RegisterDataUseCase,
    private readonly searchDataUseCase: SearchDataUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDataDto) {
    await this.registerDataUseCase.execute(
      dto.projectId,
      dto.contentId,
      dto.data,
    );
    return { success: true };
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() dto: SearchDataDto) {
    const result = await this.searchDataUseCase.execute(
      dto.search,
      dto.projectId,
      dto.contentId,
      dto.limit,
    );
    return { result };
  }
}
