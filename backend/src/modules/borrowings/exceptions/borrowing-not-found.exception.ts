import { HttpException, HttpStatus } from '@nestjs/common';

export class BorrowingNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: 'Borrowing not found',
        code: 'BORROWING_NOT_FOUND',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
