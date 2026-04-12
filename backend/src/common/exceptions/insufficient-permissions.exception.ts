import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientPermissionsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Forbidden',
        code: 'FORBIDDEN',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
