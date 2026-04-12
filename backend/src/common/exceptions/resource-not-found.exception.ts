import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string) {
    super(
      { message: `${resource} not found`, code: `${resource.toUpperCase()}_NOT_FOUND` },
      HttpStatus.NOT_FOUND,
    );
  }
}
