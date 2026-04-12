import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatedReviewResponseDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiPropertyOptional({ example: 'The best book I have ever read.' })
  content?: string;

  @ApiProperty({ example: '2026-04-10T12:53:16.427Z' })
  createdAt: Date;

  @ApiProperty({ example: '30bc0540-64c0-4b2e-9322-2990e14e4b4f' })
  bookId: string;
}
