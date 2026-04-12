import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { Role } from '../../../prisma/prisma.types.js';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password',
  })
  @IsString()
  @IsStrongPassword()
  readonly password: string;

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

  @ApiPropertyOptional({
    example: 'USER',
    description: 'User role (default: USER)',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  readonly role?: Role;
}
