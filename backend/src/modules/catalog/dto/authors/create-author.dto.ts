import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    example: 'J.K.',
    description: 'Author first name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  readonly firstName: string;

  @ApiProperty({
    example: 'Rowling',
    description: 'Author last name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  readonly lastName: string;
}
