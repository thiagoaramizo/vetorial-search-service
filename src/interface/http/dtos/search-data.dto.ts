import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SearchDataDto {
  @IsString()
  @IsNotEmpty()
  search: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  contentId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}
