import { IsOptional, IsString } from 'class-validator';

export class ListDataDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  contentId?: string;
}
