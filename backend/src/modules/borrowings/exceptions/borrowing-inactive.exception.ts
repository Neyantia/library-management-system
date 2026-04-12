import { HttpException, HttpStatus } from '@nestjs/common';

export class BorrowingInactiveException extends HttpException {
  constructor() {
    super(
      {
        message: 'Borrowing is inactive',
        code: 'BORROWING_INACTIVE',
      },
      HttpStatus.CONFLICT,
    );
  }
}
