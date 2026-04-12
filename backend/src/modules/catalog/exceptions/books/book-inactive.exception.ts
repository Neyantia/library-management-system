import { HttpException, HttpStatus } from '@nestjs/common';

export class BookInactiveException extends HttpException {
  constructor() {
    super(
      {
        message: 'Book is inactive',
        code: 'BOOK_INACTIVE',
      },
      HttpStatus.CONFLICT,
    );
  }
}
