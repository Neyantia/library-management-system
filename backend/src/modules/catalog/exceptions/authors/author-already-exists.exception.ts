import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Author already exists',
        code: 'AUTHOR_ALREADY_EXISTS',
      },
      HttpStatus.CONFLICT,
    );
  }
}
