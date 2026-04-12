import { HttpException, HttpStatus } from '@nestjs/common';

export class UserInactiveException extends HttpException {
  constructor() {
    super(
      {
        message: 'User inactive',
        code: 'USER_INACTIVE',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
