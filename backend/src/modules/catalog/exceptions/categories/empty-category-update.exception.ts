import { HttpException, HttpStatus } from '@nestjs/common';

export class EmptyCategoryUpdateException extends HttpException {
  constructor() {
    super(
      {
        message: 'At least one field must be provided',
        code: 'EMPTY_CATEGORY_UPDATE',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
