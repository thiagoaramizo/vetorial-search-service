import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RemoveDataDto {
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
}
