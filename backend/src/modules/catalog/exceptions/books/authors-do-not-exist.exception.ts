import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthorsDoNotExistException extends HttpException {
  constructor() {
    super(
      {
        message: 'One or more authors do not exist',
        code: 'AUTHORS_DO_NOT_EXIST',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
