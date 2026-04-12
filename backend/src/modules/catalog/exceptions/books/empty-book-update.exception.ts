import { HttpException, HttpStatus } from '@nestjs/common';

export class EmptyBookUpdateException extends HttpException {
  constructor() {
    super(
      {
        message: 'At least one field must be provided',
        code: 'EMPTY_BOOK_UPDATE',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
