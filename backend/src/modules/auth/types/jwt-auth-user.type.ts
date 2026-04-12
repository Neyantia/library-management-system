import type { Role } from 'src/prisma/prisma.types.js';

export type JwtAuthUser = {
  userId: string;
  role: Role;
  jti: string;
};
