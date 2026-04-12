import { HttpException, HttpStatus } from '@nestjs/common';

export class InactiveAccountException extends HttpException {
  constructor() {
    super(
      {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
