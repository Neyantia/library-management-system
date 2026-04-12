import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorInactiveException extends HttpException {
  constructor() {
    super(
      {
        message: 'Author is inactive',
        code: 'AUTHOR_INACTIVE',
      },
      HttpStatus.CONFLICT,
    );
  }
}
