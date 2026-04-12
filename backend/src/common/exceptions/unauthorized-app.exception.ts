import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedAppException extends HttpException {
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
