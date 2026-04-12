import { ApiProperty } from '@nestjs/swagger';
import { BookStatus, BorrowingStatus } from '../../../prisma/prisma.types.js';

export class BorrowingListItemResponseDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ enum: BorrowingStatus, example: BorrowingStatus.RETURNED })
  status: BorrowingStatus;

  @ApiProperty({ example: '2026-04-10T12:53:16.427Z' })
  borrowedAt: Date;

  @ApiProperty({ example: '2026-04-10T12:53:16.427Z' })
  dueDate: Date;

  @ApiProperty({ example: '2026-04-10T12:53:16.427Z' })
  returnedAt: Date | null;

  @ApiProperty({ example: '30bc0540-64c0-4b2e-9322-2990e14e4b4f' })
  bookId: string;

  @ApiProperty({ example: 'Harry Potter' })
  bookTitle: string;

  @ApiProperty({ example: 'FAN-2026-30BC0-001' })
  inventoryNumber: string;

  @ApiProperty({ enum: BookStatus, example: BookStatus.AVAILABLE })
  bookCopyStatus: BookStatus;
}
