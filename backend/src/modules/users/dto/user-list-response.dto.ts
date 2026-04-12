import { ApiProperty } from '@nestjs/swagger';
import { UserListItemDto } from './user-list-item.dto.js';

export class UsersListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 57 })
  total: number;

  @ApiProperty({ example: 6 })
  totalPages: number;
}

export class UsersListResponseDto {
  @ApiProperty({ type: UserListItemDto, isArray: true })
  items: UserListItemDto[];

  @ApiProperty({ type: UsersListMetaDto })
  meta: UsersListMetaDto;
}
