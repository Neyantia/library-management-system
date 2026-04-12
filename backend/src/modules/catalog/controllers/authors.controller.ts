import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Roles } from '../../auth/roles/roles.decorator.js';
import { Role } from '../../../prisma/prisma.types.js';
import { RolesGuard } from '../../auth/roles/roles.guard.js';

import { AuthorsService } from '../services/authors.service.js';

import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';
import { CreateAuthorDto } from '../dto/authors/create-author.dto.js';
import { CreatedAuthorResponseDto } from '../dto/authors/created-author-response.dto.js';
import { ListAuthorsResponseDto } from '../dto/authors/list-authors-response.dto.js';
import { UpdateAuthorDto } from '../dto/authors/update-author.dto.js';
import { UpdatedAuthorResponseDto } from '../dto/authors/updated-author-reponse.dto.js';

@Controller('authors')
export class AuthorsController {
  constructor(private authorsService: AuthorsService) {}

  // ################################
  // ########### AUTHOR #############
  // ################################

  // ---------------------------
  // --------- / (GET) ---------
  // ---------------------------

  @ApiOperation({
    summary: 'Get all authors',
    description: 'Returns a list of all active authors.',
  })
  @ApiOkResponse({
    description: 'Authors retrieved successfully',
    type: ListAuthorsResponseDto,
  })
  @Get()
  async getAllAuthors(): Promise<ListAuthorsResponseDto> {
    const result = await this.authorsService.getAllAuthors();

    return {
      items: result.map((author) => ({
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
      })),
    };
  }

  // ---------------------------
  // --------- / (POST) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create author',
    description:
      'Creates a new author or reactivates an existing inactive author. Accessible only to administrators.',
  })
  @ApiCreatedResponse({
    description: 'Author created successfully',
    type: CreatedAuthorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Author already exists',
    type: ErrorResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createAuthor(@Body() author: CreateAuthorDto): Promise<CreatedAuthorResponseDto> {
    const createdAuthor = await this.authorsService.createAuthor(author);

    return {
      id: createdAuthor.id,
      firstName: createdAuthor.firstName,
      lastName: createdAuthor.lastName,
    };
  }

  // ---------------------------
  // -------- / (PATCH) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update author',
    description: 'Updates an active author. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'Author updated successfully',
    type: UpdatedAuthorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or empty update payload',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Author not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Author already exists',
    type: ErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateAuthor(
    @Param('id', new ParseUUIDPipe()) authorId: string,
    @Body() author: UpdateAuthorDto,
  ): Promise<UpdatedAuthorResponseDto> {
    const updatedAuthor = await this.authorsService.updateAuthor(authorId, author);

    return {
      id: updatedAuthor.id,
      firstName: updatedAuthor.firstName,
      lastName: updatedAuthor.lastName,
    };
  }

  // ---------------------------
  // ------- / (DELETE) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete author',
    description: 'Deactivates an author. Accessible only to administrators.',
  })
  @ApiNoContentResponse({
    description: 'Author deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Author not found',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteAuthor(@Param('id', new ParseUUIDPipe()) authorId: string): Promise<void> {
    await this.authorsService.deleteAuthor(authorId);
  }
}
