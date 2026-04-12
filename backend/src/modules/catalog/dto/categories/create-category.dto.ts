import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Fantasy',
    description: 'Book category',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly name: string;

  @ApiPropertyOptional({
    example:
      'Fantasy is a genre of speculative fiction that involves supernatural or magical elements, often including completely imaginary realms and creatures',
    description: 'Category description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly description?: string;
}
