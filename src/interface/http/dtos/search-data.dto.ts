import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDataDto {
  @ApiProperty({ description: 'The search query', example: 'semantic search' })
  @IsString()
  @IsNotEmpty()
  search: string;

  @ApiPropertyOptional({
    description: 'Filter by project ID',
    example: 'my-project-id',
  })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by content ID',
    example: 'my-content-id',
  })
  @IsString()
  @IsOptional()
  contentId?: string;

  @ApiPropertyOptional({
    description: 'Limit the number of results',
    example: 5,
    default: 5,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}
