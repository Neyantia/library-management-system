import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({ example: 'c75358cd-75dd-4460-8000-bb9446b5254c' })
  userId: string;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty({ example: 'd9aaa9c7-8811-4430-af81-96335f7fc817' })
  jti: string;
}
