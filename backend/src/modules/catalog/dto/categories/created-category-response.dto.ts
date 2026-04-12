import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatedCategoryResponseDto {
  @ApiProperty({ example: 'ceae8333-47a6-462b-9920-2f0051example' })
  id: string;

  @ApiProperty({ example: 'Fantasy' })
  name: string;

  @ApiPropertyOptional({
    example:
      'Fantasy is a genre of speculative fiction that involves supernatural or magical elements, often including completely imaginary realms and creatures',
  })
  description?: string;
}
