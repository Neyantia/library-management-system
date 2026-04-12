import { Role } from 'src/prisma/prisma.types.js';

export interface JwtPayload {
  sub: string;
  role: Role;
  jti: string;
}
