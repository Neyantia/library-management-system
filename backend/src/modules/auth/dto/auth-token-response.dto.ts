import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZWFlODMzMy00N2E2LTQ2MmItOTkyMC0yZjAwNTE5OGM3YjgiLCJyb2xlIjoiQURNSU4iLCJqdGkiOiIwMGU2MTJjYi1iMzUyLTRiY2ItOTkxNS0wNDMzNTc2NGQ5ZWEiLCJpYXQiOjE3NzM2OTM0NDMsImV4cCI6MTc3MzY5NDM0MywiYXVkIjoiYm9pbGVycGxhdGUiLCJpc3MiOiJib2lsZXJwbGF0ZSJ9.signature',
    description: 'JWT access token',
  })
  accessToken: string;
}
