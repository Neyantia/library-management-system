import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({
    example: ['email must be an email', 'password is too weak'],
    required: false,
    type: [String],
  })
  details?: string[];

  @ApiProperty({ example: '2026-03-19T22:08:27.821Z' })
  timestamp: string;

  @ApiProperty({ example: '/users/me' })
  path: string;
}
