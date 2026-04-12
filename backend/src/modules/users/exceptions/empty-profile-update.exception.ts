import { HttpException, HttpStatus } from '@nestjs/common';

export class EmptyProfileUpdateException extends HttpException {
  constructor() {
    super(
      {
        message: 'At least one field must be provided',
        code: 'EMPTY_PROFILE_UPDATE',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
