import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class RegisterDataDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  contentId: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  data: string[];
}
