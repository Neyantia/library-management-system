import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception.js';

@Injectable()
export class RefreshSessionService {
  private readonly logger = new Logger(RefreshSessionService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  // -------------------------------
  // ----------- HELPERS -----------
  // -------------------------------

  private issueRefreshTokenPlain() {
    return randomBytes(32).toString('base64url');
  }

  private hashRefreshToken(token: string) {
    return hash(token);
  }

  private async verifyRefreshToken(hashedToken: string, plainToken: string) {
    try {
      return await verify(hashedToken, plainToken);
    } catch {
      return false;
    }
  }

  private getRefreshTtlSeconds() {
    return this.config.getOrThrow<number>('auth.jwt.refresh.ttl');
  }

  private computeExpiresAt(now: Date, ttlSeconds: number) {
    return new Date(now.getTime() + ttlSeconds * 1000);
  }

  private async mintRefresh(now: Date) {
    const tokenPlain = this.issueRefreshTokenPlain();
    const tokenHash = await this.hashRefreshToken(tokenPlain);
    const ttl = this.getRefreshTtlSeconds();
    const expiresAt = this.computeExpiresAt(now, ttl);

    return { tokenPlain, tokenHash, expiresAt };
  }

  // -------------------------------
  // -------- CREATE SESSION -------
  // -------------------------------

  async createSession(userId: string, meta?: { ip?: string; userAgent?: string }) {
    const now = new Date();
    const limit = this.config.getOrThrow<number>('sessions.active');
    const {
      tokenPlain: refreshTokenPlain,
      tokenHash: refreshTokenHash,
      expiresAt,
    } = await this.mintRefresh(now);

    // ----- TRANSACTION TO CREATE NEW SESSION AND REVOKE ALL SESSIONS BEYOND THE LIMIT -----
    return this.prisma.$transaction(async (tx) => {
      // ----- CREATE NEW SESSION -----
      const session = await tx.refreshSession.create({
        data: {
          userId,
          tokenHash: refreshTokenHash,
          expiresAt,
          ip: meta?.ip,
          userAgent: meta?.userAgent,
        },
        select: { id: true, expiresAt: true },
      });

      // ----- GET OLDEST ACTIVE SESSIONS -----
      const activeSessions = await tx.refreshSession.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: now } },
        take: limit + 1,
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });

      // ----- IF LIMIT EXCEEDED -> REVOKE OLDEST SESSION -----
      if (activeSessions.length > limit) {
        const oldestSessionId = activeSessions[0].id;

        await tx.refreshSession.update({
          where: { id: oldestSessionId },
          data: { revokedAt: now },
        });
      }

      return {
        refresh: {
          token: refreshTokenPlain,
          sessionId: session.id,
          expiresAt: session.expiresAt,
        },
      };
    });
  }

  // ---------------------------------
  // --------- ROTATE SESSION --------
  // ---------------------------------

  async rotateSession(
    sessionId: string,
    refreshTokenPlain: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    // ----- GET SESSION FROM DB -----
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        revokedAt: true,
        expiresAt: true,
      },
    });
    const now = new Date();

    // ------ GUARDS -----
    if (!session) {
      this.logger.warn('Session not found');
      throw new InvalidRefreshTokenException();
    }

    if (session.revokedAt) {
      this.logger.warn('Session revoked');
      throw new InvalidRefreshTokenException();
    }

    if (session.expiresAt.getTime() <= now.getTime()) {
      this.logger.warn('Session expired');
      throw new InvalidRefreshTokenException();
    }

    const refreshTokenMatch = await this.verifyRefreshToken(session.tokenHash, refreshTokenPlain);

    if (!refreshTokenMatch) {
      this.logger.warn('Invalid refresh token attempt', {
        userId: session.userId,
        sessionId,
        ip: meta?.ip,
      });

      await this.revokeAll(session.userId, now);
      throw new InvalidRefreshTokenException();
    }

    // ----- ROTATE TOKEN VARIABLES -----
    const {
      tokenPlain: newRefreshTokenPlain,
      tokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt,
    } = await this.mintRefresh(now);

    // ----- RACE CONDITION -----
    return this.prisma.$transaction(async (tx) => {
      // ----- CLAIM SESSION -----
      const result = await tx.refreshSession.updateMany({
        where: { id: sessionId, revokedAt: null, expiresAt: { gt: now } },
        data: { revokedAt: now },
      });

      if (result.count === 0) {
        this.logger.warn(`Refresh token mismatch for session ${sessionId}`);
        throw new InvalidRefreshTokenException();
      }

      // ----- CREATE NEW SESSION -----
      const newSession = await tx.refreshSession.create({
        data: {
          userId: session.userId,
          tokenHash: newRefreshTokenHash,
          expiresAt: newExpiresAt,
          ip: meta?.ip,
          userAgent: meta?.userAgent,
        },
      });

      // ----- UPDATE OLD SESSION -----
      await tx.refreshSession.update({
        where: { id: sessionId },
        data: {
          replacedById: newSession.id,
        },
      });

      return {
        userId: newSession.userId,
        refresh: {
          token: newRefreshTokenPlain,
          sessionId: newSession.id,
          expiresAt: newSession.expiresAt,
        },
      };
    });
  }

  // -------------------------------
  // -------- REVOKE SESSION -------
  // -------------------------------

  async revokeSession(sessionId: string, now: Date) {
    const result = await this.prisma.refreshSession.updateMany({
      where: { id: sessionId, revokedAt: null, expiresAt: { gt: now } },
      data: { revokedAt: now },
    });

    if (result.count === 0) {
      this.logger.warn(`Attempt to revoke non-active session ${sessionId}`);
    }
  }

  // -------------------------------
  // ----- REVOKE ALL SESSIONS -----
  // -------------------------------

  async revokeAll(userId: string, now: Date) {
    this.logger.warn('All sessions revoked due to token mismatch', {
      userId,
    });

    await this.prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null, expiresAt: { gt: now } },
      data: { revokedAt: now },
    });
  }
}
