import { HttpException, HttpStatus } from '@nestjs/common';

export class BookNotBorrowedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Book not borrowed',
        code: 'BOOK_NOT_BORROWED',
      },
      HttpStatus.CONFLICT,
    );
  }
}
