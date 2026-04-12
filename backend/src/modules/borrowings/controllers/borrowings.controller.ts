import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import type { JwtAuthUser } from '../../auth/types/jwt-auth-user.type.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';

import { BorrowingsService } from '../services/borrowings.service.js';

import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';
import { BorrowBookDto } from '../dto/borrow-book.dto.js';
import { BorrowedBookResponseDto } from '../dto/borrowed-book-response.dto.js';
import { ReturnedBookResponseDto } from '../dto/returned-book-response.dto.js';
import { ListBorrowingsResponseDto } from '../dto/list-borrowings-response.dto.js';
import { BorrowBooksDto } from '../dto/borrow-books.dto.js';

@Controller('borrowings')
export class BorrowingsController {
  constructor(private borrowingsService: BorrowingsService) {}

  // ---------------------------
  // --------- / (POST) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Borrow book',
    description: 'Borrows a book for the authenticated user by assigning the first available copy.',
  })
  @ApiCreatedResponse({
    description: 'Book borrowed successfully',
    type: BorrowedBookResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or book not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Book is inactive or no available copies exist',
    type: ErrorResponseDto,
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async borrowBook(
    @CurrentUser() user: JwtAuthUser,
    @Body() borrowBookDto: BorrowBookDto,
  ): Promise<BorrowedBookResponseDto> {
    const result = await this.borrowingsService.borrowBook(user.userId, borrowBookDto);

    return {
      id: result.id,
      status: result.status,
      borrowedAt: result.borrowedAt,
      dueDate: result.dueDate,
      bookId: result.bookCopy.book.id,
      bookTitle: result.bookCopy.book.title,
      inventoryNumber: result.bookCopy.inventoryNumber,
      bookCopyStatus: result.bookCopy.status,
    };
  }

  // ---------------------------
  // ------- /CART (POST) ------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Borrow books from cart',
    description:
      'Borrows books for the authenticated user by assigning the first available copy for each book.',
  })
  @ApiCreatedResponse({
    description: 'Books borrowed successfully',
    type: ListBorrowingsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or one or more books not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'One or more books are inactive or have no available copies',
    type: ErrorResponseDto,
  })
  @Post('cart')
  @UseGuards(JwtAuthGuard)
  async borrowBooks(
    @CurrentUser() user: JwtAuthUser,
    @Body() borrowBooksDto: BorrowBooksDto,
  ): Promise<ListBorrowingsResponseDto> {
    const result = await this.borrowingsService.borrowBooks(user.userId, borrowBooksDto);

    return {
      items: result.map((item) => ({
        id: item.id,
        status: item.status,
        borrowedAt: item.borrowedAt,
        dueDate: item.dueDate,
        returnedAt: item.returnedAt ?? null,
        bookId: item.bookCopy.book.id,
        bookTitle: item.bookCopy.book.title,
        inventoryNumber: item.bookCopy.inventoryNumber,
        bookCopyStatus: item.bookCopy.status,
      })),
    };
  }

  // ---------------------------
  // ---- /ID/RETURN (POST) ----
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Return book',
    description:
      'Returns a book for the authenticated user by updating the borrowing and book copy status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Borrowing ID',
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
  })
  @ApiOkResponse({
    description: 'Book returned successfully',
    type: ReturnedBookResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid borrowing ID format',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or borrowing not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Borrowing is inactive',
    type: ErrorResponseDto,
  })
  @Post(':id/return')
  @UseGuards(JwtAuthGuard)
  async returnBook(
    @CurrentUser() user: JwtAuthUser,
    @Param('id', new ParseUUIDPipe()) borrowingId: string,
  ): Promise<ReturnedBookResponseDto> {
    const result = await this.borrowingsService.returnBook(user.userId, borrowingId);

    return {
      id: result.id,
      status: result.status,
      borrowedAt: result.borrowedAt,
      dueDate: result.dueDate,
      returnedAt: result.returnedAt ?? null,
      bookId: result.bookCopy.book.id,
      bookTitle: result.bookCopy.book.title,
      inventoryNumber: result.bookCopy.inventoryNumber,
      bookCopyStatus: result.bookCopy.status,
    };
  }

  // ---------------------------
  // ---- /ME/CURRENT (GET) ----
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current borrowings',
    description:
      'Returns a list of the authenticated user’s current borrowings, including ACTIVE and OVERDUE items.',
  })
  @ApiOkResponse({
    description: 'Borrowings retrieved successfully',
    type: ListBorrowingsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Get('me/current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserBorrowings(
    @CurrentUser() user: JwtAuthUser,
  ): Promise<ListBorrowingsResponseDto> {
    const result = await this.borrowingsService.getCurrentUserBorrowings(user.userId);

    return {
      items: result.map((item) => ({
        id: item.id,
        status: item.status,
        borrowedAt: item.borrowedAt,
        dueDate: item.dueDate,
        returnedAt: item.returnedAt ?? null,
        bookId: item.bookCopy.book.id,
        bookTitle: item.bookCopy.book.title,
        inventoryNumber: item.bookCopy.inventoryNumber,
        bookCopyStatus: item.bookCopy.status,
      })),
    };
  }

  // ---------------------------
  // ---- /ME/HISTORY (GET) ----
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get borrowings history',
    description: 'Returns a list of the authenticated user’s borrowings history.',
  })
  @ApiOkResponse({
    description: 'Borrowings history retrieved successfully',
    type: ListBorrowingsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Get('me/history')
  @UseGuards(JwtAuthGuard)
  async getUserBorrowingHistory(
    @CurrentUser() user: JwtAuthUser,
  ): Promise<ListBorrowingsResponseDto> {
    const result = await this.borrowingsService.getUserBorrowingHistory(user.userId);

    return {
      items: result.map((item) => ({
        id: item.id,
        status: item.status,
        borrowedAt: item.borrowedAt,
        dueDate: item.dueDate,
        returnedAt: item.returnedAt ?? null,
        bookId: item.bookCopy.book.id,
        bookTitle: item.bookCopy.book.title,
        inventoryNumber: item.bookCopy.inventoryNumber,
        bookCopyStatus: item.bookCopy.status,
      })),
    };
  }
}
