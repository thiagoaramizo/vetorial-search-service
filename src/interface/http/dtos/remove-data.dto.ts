import { IsOptional, IsString } from 'class-validator';

export class RemoveDataDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  contentId?: string;
}
