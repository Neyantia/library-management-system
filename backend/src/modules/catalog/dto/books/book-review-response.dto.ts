import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookReviewResponseDto {
  @ApiProperty({ example: 5 })
  rating: number;

  @ApiPropertyOptional({ example: 'The best book I have ever read.' })
  content?: string;

  @ApiProperty({ example: '2026-04-10T12:53:16.427Z' })
  createdAt: Date;
}
