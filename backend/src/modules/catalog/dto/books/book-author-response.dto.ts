import { ApiProperty } from '@nestjs/swagger';

export class BookAuthorResponseDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ example: 'J.K.' })
  firstName: string;

  @ApiProperty({ example: 'Rowling' })
  lastName: string;
}
