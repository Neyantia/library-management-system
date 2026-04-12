import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailAlreadyInUseException extends HttpException {
  constructor() {
    super(
      {
        message: 'Email is already in use',
        code: 'EMAIL_ALREADY_IN_USE',
      },
      HttpStatus.CONFLICT,
    );
  }
}
