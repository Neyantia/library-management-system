import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotChangeOwnStatusException extends HttpException {
  constructor() {
    super(
      {
        message: 'Cannot change own status',
        code: 'CANNOT_CHANGE_OWN_STATUS',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
