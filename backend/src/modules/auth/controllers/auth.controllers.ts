import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { minutes, seconds, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import type { JwtAuthUser } from '../types/jwt-auth-user.type.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RegisterDto } from '../dto/register.dto.js';

import { AuthTokensResponseDto } from '../dto/auth-token-response.dto.js';
import { MeResponseDto } from '../dto/me-response.dto.js';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception.js';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  // ---------------------------
  // --------- HELPERS ---------
  // ---------------------------

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.getOrThrow<boolean>('cookie.secure'),
      sameSite: this.config.getOrThrow<'lax' | 'strict' | 'none'>('cookie.samesite'),
      path: '/auth',
    };
  }

  private mintOptions(expiresAt: Date, now: Date) {
    const maxAge = Math.max(0, expiresAt.getTime() - now.getTime());
    const opts = this.cookieOptions();
    return { ...opts, maxAge };
  }

  private clearCookies(res: Response) {
    const options = this.cookieOptions();
    res.clearCookie('rt', options);
    res.clearCookie('sid', options);
  }

  // ---------------------------
  // --------- REGISTER --------
  // ---------------------------

  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and automatically logs the user in by returning an access token and setting refresh cookies. Password must contains at least 8 characters with 1 number, 1 special character, 1 big letter, 1 small letter',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'User registered successfully and logged in',
    type: AuthTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email is already in use',
    type: ErrorResponseDto,
  })
  @Post('register')
  @Throttle({
    short: { limit: 300, ttl: seconds(10) },
    medium: { limit: 500, ttl: minutes(10) },
  })
  @HttpCode(HttpStatus.OK)
  async signUp(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const now = new Date();

    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await this.authService.signUp(body.email, body.password, meta);

    const options = this.mintOptions(result.refresh.expiresAt, now);

    // Set cookies
    res.cookie('rt', result.refresh.token, options);
    res.cookie('sid', result.refresh.sessionId, options);

    return result.access;
  }

  // ---------------------------
  // ---------- LOGIN ----------
  // ---------------------------

  @ApiOperation({
    summary: 'Log in user',
    description:
      'Authenticates user credentials, returns an access token and sets refresh cookies.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'User logged in successfully',
    type: AuthTokensResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  @Post('login')
  @Throttle({
    short: { limit: 300, ttl: seconds(10) },
    medium: { limit: 500, ttl: minutes(10) },
  })
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const now = new Date();
    // Get metadata
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };

    const result = await this.authService.signIn(body.email, body.password, meta);

    const options = this.mintOptions(result.refresh.expiresAt, now);

    // Set cookies
    res.cookie('rt', result.refresh.token, options);
    res.cookie('sid', result.refresh.sessionId, options);

    return result.access;
  }

  // ---------------------------
  // --------- REFRESH ---------
  // ---------------------------

  @ApiCookieAuth('rt')
  @ApiCookieAuth('sid')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Refreshes access token using refresh cookies: rt and sid. Requires valid refresh session.',
  })
  @ApiOkResponse({
    description: 'Access token refreshed successfully',
    type: AuthTokensResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid refresh cookies',
  })
  @Post('refresh')
  @Throttle({
    short: { limit: 10, ttl: minutes(1) },
    medium: { limit: 60, ttl: minutes(10) },
  })
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Get cookies from request
    const refreshToken = req.cookies?.rt as string;
    const sessionId = req.cookies?.sid as string;

    // ----- GUARD -----
    if (!refreshToken || !sessionId) {
      this.clearCookies(res);
      throw new InvalidRefreshTokenException();
    }

    const now = new Date();
    // Get metadata from request
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };

    try {
      const result = await this.authService.refreshRotate(sessionId, refreshToken, meta);

      const options = this.mintOptions(result.refresh.expiresAt, now);

      // rotate cookies
      res.cookie('rt', result.refresh.token, options);
      res.cookie('sid', result.refresh.sessionId, options);

      return result.access;
    } catch (e) {
      this.clearCookies(res);
      throw e;
    }
  }

  // ---------------------------
  // ------------ ME -----------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Returns basic information about the currently authenticated user based on access token.',
  })
  @ApiOkResponse({
    description: 'Authenticated user returned successfully',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
  })
  @Get('me')
  @Throttle({ short: { limit: 60, ttl: minutes(1) } })
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: JwtAuthUser) {
    return user;
  }

  // ---------------------------
  // ---------- LOGOUT ---------
  // ---------------------------

  @ApiCookieAuth('sid')
  @ApiOperation({
    summary: 'Log out current session',
    description: 'Revokes current refresh session and clears refresh cookies.',
  })
  @ApiNoContentResponse({
    description: 'Logged out successfully',
  })
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies?.sid as string;

    // ----- GUARD -----
    if (!sessionId) {
      this.clearCookies(res);
      return;
    }

    try {
      await this.authService.logout(sessionId);
    } finally {
      this.clearCookies(res);
    }

    return;
  }

  // ---------------------------
  // -------- LOGOUT ALL -------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out from all sessions',
    description:
      'Revokes all refresh sessions for currently authenticated user and clears refresh cookies.',
  })
  @ApiNoContentResponse({
    description: 'All sessions revoked successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
  })
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async logoutAll(@CurrentUser() user: JwtAuthUser, @Res({ passthrough: true }) res: Response) {
    try {
      await this.authService.logoutAll(user.userId);
    } finally {
      this.clearCookies(res);
    }

    return;
  }
}
