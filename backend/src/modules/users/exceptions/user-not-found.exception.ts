import { ResourceNotFoundException } from '../../../common/exceptions/resource-not-found.exception.js';

export class UserNotFoundException extends ResourceNotFoundException {
  constructor() {
    super('User');
  }
}
