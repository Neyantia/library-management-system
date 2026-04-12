import { ApiProperty } from '@nestjs/swagger';
import { CreatedAuthorResponseDto } from './created-author-response.dto.js';

export class ListAuthorsResponseDto {
  @ApiProperty({ type: CreatedAuthorResponseDto, isArray: true })
  items: CreatedAuthorResponseDto[];
}
