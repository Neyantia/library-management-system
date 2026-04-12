import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Category already exists',
        code: 'CATEGORY_ALREADY_EXISTS',
      },
      HttpStatus.CONFLICT,
    );
  }
}
