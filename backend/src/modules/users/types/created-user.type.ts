import { Role } from 'src/prisma/prisma.types.js';

export type CreatedUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};
