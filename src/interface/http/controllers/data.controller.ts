import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDataUseCase } from '../../../application/use-cases/register-data.use-case';
import { SearchDataUseCase } from '../../../application/use-cases/search-data.use-case';
import { ListDataUseCase } from '../../../application/use-cases/list-data.use-case';
import { RemoveDataUseCase } from '../../../application/use-cases/remove-data.use-case';
import { RegisterDataDto } from '../dtos/register-data.dto';
import { SearchDataDto } from '../dtos/search-data.dto';
import { ListDataDto } from '../dtos/list-data.dto';
import { RemoveDataDto } from '../dtos/remove-data.dto';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(
    private readonly registerDataUseCase: RegisterDataUseCase,
    private readonly searchDataUseCase: SearchDataUseCase,
    private readonly listDataUseCase: ListDataUseCase,
    private readonly removeDataUseCase: RemoveDataUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register or update data for semantic search' })
  @ApiResponse({ status: 201, description: 'Data registered successfully.' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDataDto) {
    await this.registerDataUseCase.execute(
      dto.projectId,
      dto.contentId,
      dto.data,
    );
    return { message: 'Data registered successfully' };
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for relevant data using vector embeddings' })
  @ApiResponse({ status: 200, description: 'Returns relevant documents.' })
  @HttpCode(HttpStatus.OK)
  async search(@Body() dto: SearchDataDto) {
    const results = await this.searchDataUseCase.execute(
      dto.search,
      dto.projectId,
      dto.contentId,
      dto.limit,
    );
    return { results };
  }

  @Get()
  @ApiOperation({ summary: 'List stored documents with optional filtering' })
  @ApiResponse({ status: 200, description: 'Returns a list of documents.' })
  @HttpCode(HttpStatus.OK)
  async list(@Query() query: ListDataDto) {
    const documents = await this.listDataUseCase.execute(
      query.projectId,
      query.contentId,
    );
    // Grouping similar to search or just returning flat list?
    // User requirement: "listar (filtros projectId, contentId)"
    // Let's group by default for consistency with search structure, or just flat.
    // Flat is simpler for "list".
    return {
      count: documents.length,
      data: documents.map((doc) => ({
        id: doc.id,
        projectId: doc.projectId,
        contentId: doc.contentId,
        content: doc.content,
      })),
    };
  }

  @Delete()
  @ApiOperation({ summary: 'Remove data by project or content ID' })
  @ApiResponse({ status: 200, description: 'Data removed successfully.' })
  @HttpCode(HttpStatus.OK)
  async remove(@Query() query: RemoveDataDto) {
    await this.removeDataUseCase.execute(query.projectId, query.contentId);
    return { message: 'Data removed successfully' };
  }
}
