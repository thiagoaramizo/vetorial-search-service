import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDataDto {
  @ApiProperty({
    description: 'The ID of the project',
    example: 'my-project-id',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'The ID of the content',
    example: 'my-content-id',
  })
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({
    description: 'Array of text data to index',
    example: ['text chunk 1', 'text chunk 2'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  data: string[];
}
