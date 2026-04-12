import { Role } from 'src/prisma/prisma.types.js';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  passwordHash: string;
};
