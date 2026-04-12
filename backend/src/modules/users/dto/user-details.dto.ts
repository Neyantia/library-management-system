import { ApiProperty } from '@nestjs/swagger';

export class UserDetailsDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ example: 'example@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Userski' })
  lastName: string;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-03-16T20:45:06.915Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-16T20:45:06.915Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2026-03-16T20:45:06.887Z' })
  lastLoginAt: Date | null;
}
