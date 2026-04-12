import { ApiProperty } from '@nestjs/swagger';
import { CreatedCategoryResponseDto } from './created-category-response.dto.js';

export class ListCategoriesResponseDto {
  @ApiProperty({ type: CreatedCategoryResponseDto, isArray: true })
  items: CreatedCategoryResponseDto[];
}
