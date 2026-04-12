import { ApiProperty } from '@nestjs/swagger';
import { BookListItemResponseDto } from './book-list-item-response.dto.js';

export class BooksListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 57 })
  total: number;

  @ApiProperty({ example: 6 })
  totalPages: number;
}

export class ListBooksResponseDto {
  @ApiProperty({ type: BookListItemResponseDto, isArray: true })
  items: BookListItemResponseDto[];

  @ApiProperty({ type: BooksListMetaDto })
  meta: BooksListMetaDto;
}
