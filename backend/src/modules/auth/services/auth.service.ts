import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service.js';
import { hash, verify } from '@node-rs/argon2';

import { AuthTokenService } from './auth-token.service.js';
import { RefreshSessionService } from './refresh-session.service.js';

import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception.js';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception.js';
import { InactiveAccountException } from '../exceptions/inactive-account.exception.js';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private accessTokenService: AuthTokenService,
    private refreshSessionService: RefreshSessionService,
  ) {}

  // -------------------------------
  // ----------- SIGN UP -----------
  // -------------------------------

  async signUp(email: string, password: string, meta: { ip?: string; userAgent?: string }) {
    email = email.toLowerCase().trim();
    const now = new Date();

    const doesUserExist = await this.usersService.findAuthUserByEmail(email);

    if (doesUserExist) {
      throw new EmailAlreadyInUseException();
    }

    const passwordHash = await hash(password);
    const user = await this.usersService.createUser({ email, passwordHash });

    // Get access token
    const access = await this.accessTokenService.issueAccessToken({
      id: user.id,
      role: user.role,
    });

    // Get refresh session
    const session = await this.refreshSessionService.createSession(user.id, meta);

    // update lastLoginAt
    await this.usersService.updateLastLoginAt(user.id, now);

    return {
      access,
      refresh: session.refresh,
      user: { id: user.id, role: user.role },
    };
  }

  // -------------------------------
  // ----------- SIGN IN -----------
  // -------------------------------

  async signIn(email: string, password: string, meta: { ip?: string; userAgent?: string }) {
    email = email.toLowerCase().trim();
    const now = new Date();
    // Common Error message for user email and password
    // Check if user exists in DB or if it is not active
    const user = await this.usersService.findAuthUserByEmail(email);
    if (!user || !user.isActive) {
      this.logger.warn('Failed login attempt', {
        email,
        ip: meta?.ip,
      });

      throw new InvalidCredentialsException();
    }

    // Compare passwords
    const isPasswordMatch = await verify(user.passwordHash, password);
    if (!isPasswordMatch) {
      this.logger.warn('Failed login attempt', {
        email,
        ip: meta?.ip,
      });

      throw new InvalidCredentialsException();
    }

    // Get access token
    const access = await this.accessTokenService.issueAccessToken({
      id: user.id,
      role: user.role,
    });

    // Get refresh session
    const session = await this.refreshSessionService.createSession(user.id, meta);

    // update lastLoginAt
    await this.usersService.updateLastLoginAt(user.id, now);

    return {
      access,
      refresh: session.refresh,
      user: { id: user.id, role: user.role },
    };
  }

  // -------------------------------
  // -------- REFRESH ROTATE -------
  // -------------------------------

  async refreshRotate(
    sessionId: string,
    refreshTokenPlain: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    // Get rotated session
    const rotated = await this.refreshSessionService.rotateSession(
      sessionId,
      refreshTokenPlain,
      meta,
    );

    // ----- GUARDS -----
    const user = await this.usersService.findJwtUserById(rotated.userId);
    if (!user) {
      this.logger.warn('User not found');
      await this.refreshSessionService.revokeAll(rotated.userId, new Date());
      throw new InactiveAccountException();
    }

    if (!user.isActive) {
      this.logger.warn('User is not active');
      await this.refreshSessionService.revokeAll(rotated.userId, new Date());
      throw new InvalidRefreshTokenException();
    }

    // Get access token
    const access = await this.accessTokenService.issueAccessToken({
      id: user.id,
      role: user.role,
    });

    return {
      access,
      refresh: rotated.refresh,
      user: { id: user.id, role: user.role },
    };
  }

  // -------------------------------
  // ----------- LOG OUT -----------
  // -------------------------------

  async logout(sessionId: string) {
    const now = new Date();
    await this.refreshSessionService.revokeSession(sessionId, now);
  }

  // -------------------------------
  // --------- LOGOUT ALL ----------
  // -------------------------------

  async logoutAll(userId: string) {
    const now = new Date();
    await this.refreshSessionService.revokeAll(userId, now);
  }
}
