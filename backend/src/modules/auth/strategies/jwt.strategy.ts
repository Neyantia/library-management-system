import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('auth.jwt.access.secret'),
      issuer: config.getOrThrow<string>('auth.jwt.issuer'),
      audience: config.getOrThrow<string>('auth.jwt.audience'),
    });
  }

  validate(payload: JwtPayload) {
    // return { userId: user.id, email: user.email, role: user.role }; // choose this if you want to have current user data from DB and add DB request
    return { userId: payload.sub, role: payload.role, jti: payload.jti };
  }
}
