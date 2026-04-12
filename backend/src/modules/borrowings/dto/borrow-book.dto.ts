import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BorrowBookDto {
  @ApiProperty({ example: '0f8fad5b-d9cb-469f-a165-70867728950e', description: 'Book ID' })
  @IsUUID()
  readonly bookId: string;
}
