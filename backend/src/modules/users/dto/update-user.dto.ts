import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John',
    description: 'User first name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly firstName?: string;

  @ApiPropertyOptional({
    example: 'Userski',
    description: 'User last name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly lastName?: string;
}
