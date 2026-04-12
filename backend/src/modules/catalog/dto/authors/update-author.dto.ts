import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAuthorDto {
  @ApiPropertyOptional({
    example: 'J.K.',
    description: 'Author first name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly firstName?: string;

  @ApiPropertyOptional({
    example: 'Rowling',
    description: 'Author last name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  readonly lastName?: string;
}
