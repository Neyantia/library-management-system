import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsISBN,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ArrayUnique,
} from 'class-validator';

export class UpdateBookDto {
  @ApiPropertyOptional({
    example: 'Harry Potter',
    description: 'Book title',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly title?: string;

  @ApiPropertyOptional({
    example: 'Deathly Hallows',
    description: 'Book subtitle',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly subtitle?: string;

  @ApiPropertyOptional({
    example: 'The Deathly Hallows were three magical objects that contained great power...',
    description: 'Book description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  readonly description?: string;

  @ApiPropertyOptional({
    example: '9780747591061',
    description: 'Book ISBN',
  })
  @IsISBN()
  @IsOptional()
  readonly isbn?: string;

  @ApiPropertyOptional({
    example: 'English',
    description: 'Book language',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  readonly language?: string;

  @ApiPropertyOptional({
    example: 'https://static.posters.cz/image/1300/214933.jpg',
    description: 'Book cover image URL',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  readonly coverImageUrl?: string;

  @ApiPropertyOptional({
    example: 2007,
    description: 'Book publication year',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(new Date().getFullYear())
  readonly publicationYear?: number;

  @ApiPropertyOptional({
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
    description: 'Category ID',
  })
  @IsUUID()
  @IsOptional()
  readonly categoryId?: string;

  @ApiPropertyOptional({
    example: ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'],
    description: 'Author IDs',
  })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  @IsUUID('4', { each: true })
  readonly authorIds?: string[];
}
