import { Role } from 'src/prisma/prisma.types.js';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
};
