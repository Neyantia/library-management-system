import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookCategoryResponseDto } from './book-category-response.dto.js';
import { BookAuthorResponseDto } from './book-author-response.dto.js';

export class BookListItemResponseDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ example: 'Harry Potter' })
  title: string;

  @ApiPropertyOptional({ example: 'Deathly Hallows' })
  subtitle?: string;

  @ApiPropertyOptional({
    example: 'https://static.posters.cz/image/1300/214933.jpg',
  })
  coverImageUrl?: string;

  @ApiProperty({ example: 2026 })
  publicationYear: number;

  @ApiProperty({
    type: BookAuthorResponseDto,
    isArray: true,
    example: [
      {
        id: '2287d425-3a34-4c64-be6e-17367d5cbcda',
        firstName: 'J.K',
        lastName: 'Rowling',
      },
    ],
  })
  authors: BookAuthorResponseDto[];

  @ApiProperty({
    example: {
      id: 'fa234296-75a4-487e-b6bf-1a86ae2d1068',
      name: 'Fantasy',
    },
  })
  category: BookCategoryResponseDto;

  @ApiProperty({ example: 1 })
  copiesCount: number;

  @ApiProperty({ example: 1 })
  availableCopiesCount: number;

  @ApiProperty({ example: 4.36 })
  rating?: number;

  @ApiProperty({ example: 38 })
  reviewsCount?: number;
}
