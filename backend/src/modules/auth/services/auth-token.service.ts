import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { JwtPayload } from '../types/jwt-payload.type.js';
import { Role } from 'src/prisma/prisma.types.js';

@Injectable()
export class AuthTokenService {
  constructor(private jwtService: JwtService) {}

  async issueAccessToken(user: { id: string; role: Role }) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
    };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
