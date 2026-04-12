import { HttpException, HttpStatus } from '@nestjs/common';

export class BookAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Book already exists',
        code: 'BOOK_ALREADY_EXISTS',
      },
      HttpStatus.CONFLICT,
    );
  }
}
