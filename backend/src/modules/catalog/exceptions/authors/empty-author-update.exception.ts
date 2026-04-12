import { HttpException, HttpStatus } from '@nestjs/common';

export class EmptyAuthorUpdateException extends HttpException {
  constructor() {
    super(
      {
        message: 'At least one field must be provided',
        code: 'EMPTY_AUTHOR_UPDATE',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
