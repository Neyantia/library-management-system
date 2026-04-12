import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotReduceCopiesBelowBorrowedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Cannot reduce copies count below the number of borrowed copies',
        code: 'CANNOT_REDUCE_BOOK_COPIES',
      },
      HttpStatus.CONFLICT,
    );
  }
}
