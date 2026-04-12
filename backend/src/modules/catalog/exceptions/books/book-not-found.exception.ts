import { HttpException, HttpStatus } from '@nestjs/common';

export class BookNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: 'Book not found',
        code: 'BOOK_NOT_FOUND',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
