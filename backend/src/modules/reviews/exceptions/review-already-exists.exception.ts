import { HttpException, HttpStatus } from '@nestjs/common';

export class ReviewAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Review already exists',
        code: 'REVIEW_ALREADY_EXISTS',
      },
      HttpStatus.CONFLICT,
    );
  }
}
