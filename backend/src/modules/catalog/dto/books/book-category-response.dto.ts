import { ApiProperty } from '@nestjs/swagger';

export class BookCategoryResponseDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ example: 'Fantasy' })
  name: string;
}
