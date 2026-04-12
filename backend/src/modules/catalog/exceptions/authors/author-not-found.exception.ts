import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: 'Author not found',
        code: 'AUTHOR_NOT_FOUND',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
