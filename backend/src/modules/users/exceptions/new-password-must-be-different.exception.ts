import { HttpException, HttpStatus } from '@nestjs/common';

export class NewPasswordMustBeDifferentException extends HttpException {
  constructor() {
    super(
      {
        message: 'New password must be different from the current one',
        code: 'NEW_PASSWORD_MUST_BE_DIFFERENT',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
