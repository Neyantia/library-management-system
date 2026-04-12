import { ApiProperty } from '@nestjs/swagger';
import { BorrowingListItemResponseDto } from './borrowing-list-item-response.dto.js';

export class ListBorrowingsResponseDto {
  @ApiProperty({ type: BorrowingListItemResponseDto, isArray: true })
  items: BorrowingListItemResponseDto[];
}
