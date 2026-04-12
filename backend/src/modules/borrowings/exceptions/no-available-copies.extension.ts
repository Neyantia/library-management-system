import { HttpException, HttpStatus } from '@nestjs/common';

export class NoAvailableCopiesException extends HttpException {
  constructor() {
    super(
      {
        message: 'No available copies for this book',
        code: 'NO_AVAILABLE_COPIES',
      },
      HttpStatus.CONFLICT,
    );
  }
}
