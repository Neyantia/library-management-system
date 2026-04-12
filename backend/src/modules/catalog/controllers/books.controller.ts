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
  Query,
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
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/roles/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/roles/roles.guard.js';

import { BookStatus, Role } from '../../../prisma/prisma.types.js';

import { BooksService } from '../services/books.service.js';

import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';
import { CreateBookDto } from '../dto/books/create-book.dto.js';
import { CreatedBookResponseDto } from '../dto/books/created-book-response.dto.js';
import { BookDetailsResponseDto } from '../dto/books/book-details-response.dto.js';
import { ListBooksQueryDto } from '../dto/books/list-books-query.dto.js';
import { ListBooksResponseDto } from '../dto/books/list-books-response.dto.js';
import { UpdatedBookResponseDto } from '../dto/books/updated-book-response.dto.js';
import { UpdateBookDto } from '../dto/books/update-book.dto.js';
import { UpdateCopiesCountDto } from '../dto/books/update-copies-count.dto.js';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  // ################################
  // ############ BOOK ##############
  // ################################

  // ---------------------------
  // --------- / (POST) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create book',
    description: 'Creates a new book. Accessible only to administrators.',
  })
  @ApiCreatedResponse({
    description: 'Book created successfully',
    type: CreatedBookResponseDto,
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
    description: 'Book already exists',
    type: ErrorResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createBook(@Body() book: CreateBookDto): Promise<CreatedBookResponseDto> {
    const result = await this.booksService.createBook(book);

    return {
      id: result.id,
      title: result.title,
      subtitle: result.subtitle ?? undefined,
      description: result.description ?? undefined,
      isbn: result.isbn,
      publicationYear: result.publicationYear,
      language: result.language,
      coverImageUrl: result.coverImageUrl ?? undefined,
      category: result.category,
      authors: result.authors.map((item) => item.author),
      copiesCount: result.copies.length,
      availableCopiesCount: result.copies.filter((copy) => copy.status === BookStatus.AVAILABLE)
        .length,
    };
  }

  // ---------------------------
  // --------- / (GET) ---------
  // ---------------------------

  @ApiOperation({
    summary: 'Get all books',
    description: 'Returns a paginated list of books. Supports search and filtering.',
  })
  @ApiOkResponse({
    description: 'Books returned successfully',
    type: ListBooksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'Harry Potter' })
  @ApiQuery({ name: 'authorId', required: false, example: '0f8fad5b-d9cb-469f-a165-70867728950e' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
  })
  @Get()
  async getAllBooks(@Query() query: ListBooksQueryDto): Promise<ListBooksResponseDto> {
    const result = await this.booksService.getAllBooks(query);

    return {
      items: result.items.map((book) => {
        const reviewsCount = book.reviews.length;

        const rating =
          reviewsCount > 0
            ? Number(
                (book.reviews.reduce((acc, rat) => acc + rat.rating, 0) / reviewsCount).toFixed(2),
              )
            : undefined;

        return {
          id: book.id,
          title: book.title,
          subtitle: book.subtitle ?? undefined,
          coverImageUrl: book.coverImageUrl ?? undefined,
          publicationYear: book.publicationYear,
          authors: book.authors.map((item) => item.author),
          category: { id: book.category.id, name: book.category.name },
          copiesCount: book.copies.length,
          availableCopiesCount: book.copies.filter((copy) => copy.status === BookStatus.AVAILABLE)
            .length,
          rating,
          reviewsCount,
        };
      }),
      meta: result.meta,
    };
  }

  // ---------------------------
  // -------- /ID (GET) --------
  // ---------------------------

  @ApiOperation({
    summary: 'Get book details',
    description: 'Returns detailed information about a single book.',
  })
  @ApiOkResponse({
    description: 'Book details returned successfully',
    type: BookDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid book ID format',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Book not found',
    type: ErrorResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'ceae8333-47a6-462b-9920-2f0051example',
  })
  @Get(':id')
  async getBookDetails(
    @Param('id', new ParseUUIDPipe()) bookId: string,
  ): Promise<BookDetailsResponseDto> {
    const result = await this.booksService.getBookDetails(bookId);

    const reviewsCount = result.reviews.length;

    const rating =
      reviewsCount > 0
        ? Number(
            (result.reviews.reduce((acc, rat) => acc + rat.rating, 0) / reviewsCount).toFixed(2),
          )
        : undefined;

    return {
      id: result.id,
      title: result.title,
      subtitle: result.subtitle ?? undefined,
      description: result.description ?? undefined,
      isbn: result.isbn,
      publicationYear: result.publicationYear,
      language: result.language,
      coverImageUrl: result.coverImageUrl ?? undefined,
      category: result.category,
      authors: result.authors.map((item) => item.author),
      copiesCount: result.copies.length,
      availableCopiesCount: result.copies.filter((copy) => copy.status === BookStatus.AVAILABLE)
        .length,
      rating,
      reviewsCount,
      reviews: result.reviews.map((review) => {
        return {
          content: review.content ?? undefined,
          rating: review.rating,
          createdAt: review.createdAt,
        };
      }),
    };
  }

  // ---------------------------
  // -------- / (PATCH) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update book',
    description: 'Updates an active book. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'Book updated successfully',
    type: UpdatedBookResponseDto,
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
    description: 'Book not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Book already exists',
    type: ErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateBook(
    @Param('id', new ParseUUIDPipe()) bookId: string,
    @Body() book: UpdateBookDto,
  ): Promise<UpdatedBookResponseDto> {
    const result = await this.booksService.updateBook(bookId, book);

    return {
      id: result.id,
      title: result.title,
      subtitle: result.subtitle ?? undefined,
      description: result.description ?? undefined,
      isbn: result.isbn,
      publicationYear: result.publicationYear,
      language: result.language,
      coverImageUrl: result.coverImageUrl ?? undefined,
      category: result.category,
      authors: result.authors.map((item) => item.author),
      copiesCount: result.copies.length,
      availableCopiesCount: result.copies.filter((copy) => copy.status === BookStatus.AVAILABLE)
        .length,
    };
  }

  // ---------------------------
  // ---- /ID/COPIES (PATCH) ---
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update book copies count',
    description:
      'Sets the target number of operational copies for a book. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'Book copies count updated successfully',
    type: BookDetailsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or invalid book ID format',
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
    description: 'Book not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Cannot reduce copies below the number of borrowed copies',
    type: ErrorResponseDto,
  })
  @Patch(':id/copies')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateCopiesCount(
    @Param('id', new ParseUUIDPipe()) bookId: string,
    @Body() dto: UpdateCopiesCountDto,
  ): Promise<BookDetailsResponseDto> {
    const result = await this.booksService.updateCopiesCount(bookId, dto);

    const reviewsCount = result.reviews.length;

    const rating =
      reviewsCount > 0
        ? Number(
            (result.reviews.reduce((acc, rat) => acc + rat.rating, 0) / reviewsCount).toFixed(2),
          )
        : undefined;

    return {
      id: result.id,
      title: result.title,
      subtitle: result.subtitle ?? undefined,
      description: result.description ?? undefined,
      isbn: result.isbn,
      publicationYear: result.publicationYear,
      language: result.language,
      coverImageUrl: result.coverImageUrl ?? undefined,
      category: result.category,
      authors: result.authors.map((item) => item.author),
      copiesCount: result.copies.length,
      availableCopiesCount: result.copies.filter((copy) => copy.status === BookStatus.AVAILABLE)
        .length,
      rating,
      reviewsCount,
      reviews: result.reviews.map((review) => {
        return {
          content: review.content ?? undefined,
          rating: review.rating,
          createdAt: review.createdAt,
        };
      }),
    };
  }

  // ---------------------------
  // ------ /ID (DELETE) -------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete book',
    description: 'Deactivates a book. Accessible only to administrators.',
  })
  @ApiNoContentResponse({
    description: 'Book deleted successfully',
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
    description: 'Book not found',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteBook(@Param('id', new ParseUUIDPipe()) bookId: string): Promise<void> {
    await this.booksService.deleteBook(bookId);
  }
}
