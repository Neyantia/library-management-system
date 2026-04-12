import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryInactiveException extends HttpException {
  constructor() {
    super(
      {
        message: 'Category is inactive',
        code: 'CATEGORY_INACTIVE',
      },
      HttpStatus.CONFLICT,
    );
  }
}
