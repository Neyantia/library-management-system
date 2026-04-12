import { ResourceNotFoundException } from '../../../../common/exceptions/resource-not-found.exception.js';

export class CategoryNotFoundException extends ResourceNotFoundException {
  constructor() {
    super('Category');
  }
}
