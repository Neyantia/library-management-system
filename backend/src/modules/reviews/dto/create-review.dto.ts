import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 1, description: 'Review value as a number' })
  @IsInt()
  @Min(1)
  @Max(5)
  readonly rating: number;

  @ApiPropertyOptional({
    example: 'The best book I have ever read.',
    description: "Content of book's review.",
  })
  @IsString()
  @IsOptional()
  readonly content?: string;
}
