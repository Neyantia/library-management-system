import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateCopiesCountDto {
  @ApiProperty({ example: 3, description: 'New amount of book copies' })
  @IsInt()
  @Min(0)
  @Max(999)
  copies: number;
}
