import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module.js';
import { AuthController } from './controllers/auth.controllers.js';
import { AuthService } from './services/auth.service.js';
import { AuthTokenService } from './services/auth-token.service.js';
import { RefreshSessionService } from './services/refresh-session.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('auth.jwt.access.secret'),
          signOptions: {
            expiresIn: config.get<number>('auth.jwt.access.ttl'),
            issuer: config.get<string>('auth.jwt.issuer'),
            audience: config.get<string>('auth.jwt.audience'),
          },
        };
      },
    }),
    UsersModule,
  ],
  providers: [AuthService, AuthTokenService, RefreshSessionService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
