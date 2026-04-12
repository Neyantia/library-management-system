import { HttpException, HttpStatus } from '@nestjs/common';

export class WrongPasswordException extends HttpException {
  constructor() {
    super(
      {
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
