import { Test } from '@nestjs/testing';

import { Role } from '../../../prisma/prisma.types.js';

import {
  makeAuthUser,
  makeJwtUser,
  makePasswordHash,
} from '../../../../test/helpers/unit-helpers.js';

import { AuthService } from './auth.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { AuthTokenService } from './auth-token.service.js';
import { RefreshSessionService } from './refresh-session.service.js';

import { createUsersServiceMock } from '../../../../test/mocks/users.service.mock.js';
import { createAuthTokenServiceMock } from '../../../../test/mocks/auth-token.service.mock.js';
import { createRefreshSessionServiceMock } from '../../../../test/mocks/refresh-session.service.mock.js';

import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception.js';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception.js';
import { InvalidRefreshTokenException } from '../exceptions/invalid-refresh-token.exception.js';
import { InactiveAccountException } from '../exceptions/inactive-account.exception.js';

describe('AuthService', () => {
  let authService: AuthService;

  let usersServiceMock: jest.Mocked<UsersService>;
  let authTokenServiceMock: jest.Mocked<AuthTokenService>;
  let refreshSessionServiceMock: jest.Mocked<RefreshSessionService>;

  beforeEach(async () => {
    usersServiceMock = createUsersServiceMock();
    authTokenServiceMock = createAuthTokenServiceMock();
    refreshSessionServiceMock = createRefreshSessionServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        { provide: AuthTokenService, useValue: authTokenServiceMock },
        { provide: RefreshSessionService, useValue: refreshSessionServiceMock },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  // ========================
  // ===== AUTH SERVICE =====
  // ========================

  describe('constructor', () => {
    // --- AUTH SERVICE CREATED ---
    it('should create authService', () => {
      expect(authService).toBeDefined();
    });
  });

  // -------------------------------
  // ----------- SIGN UP -----------
  // -------------------------------

  describe('signUp', () => {
    // --- EMAIL IS ALREADY IN USE ---
    it('throws ConflictException when email is already in use', async () => {
      usersServiceMock.findAuthUserByEmail.mockResolvedValue(
        makeAuthUser({
          passwordHash: await makePasswordHash(),
        }),
      );

      await expect(authService.signUp('example@example.com', 'example123', {})).rejects.toThrow(
        EmailAlreadyInUseException,
      );

      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.createSession).not.toHaveBeenCalled();
      expect(usersServiceMock.createUser).not.toHaveBeenCalled();
      expect(usersServiceMock.updateLastLoginAt).not.toHaveBeenCalled();
    });

    // --- HAPPY PATH ---
    it('returns access, refresh token and user data', async () => {
      const email = 'example@example.com';
      const password = 'Example123!';
      const id = '1';
      const role = Role.USER;

      const accessToken = 'access_token';

      const expiresAt = new Date();
      const sessionId = 'session-1';
      const token = 'new-session-token';

      usersServiceMock.findAuthUserByEmail.mockResolvedValue(null);
      usersServiceMock.createUser.mockResolvedValue({
        email,
        id,
        role,
        isActive: true,
      });

      authTokenServiceMock.issueAccessToken.mockResolvedValue({
        accessToken,
      });

      refreshSessionServiceMock.createSession.mockResolvedValue({
        refresh: {
          expiresAt,
          sessionId,
          token,
        },
      });

      const result = await authService.signUp(email, password, {});

      const passedData = usersServiceMock.createUser.mock.calls[0][0];

      expect(passedData.email).toBe(email);
      expect(passedData.passwordHash).toEqual(expect.any(String));
      expect(passedData.passwordHash).not.toBe(password);

      expect(usersServiceMock.createUser).toHaveBeenCalledWith({
        email,
        passwordHash: expect.any(String),
      });

      expect(usersServiceMock.findAuthUserByEmail).toHaveBeenCalledWith(email);
      expect(usersServiceMock.findAuthUserByEmail).toHaveBeenCalledTimes(1);

      expect(authTokenServiceMock.issueAccessToken).toHaveBeenCalledWith({
        id,
        role,
      });

      expect(refreshSessionServiceMock.createSession).toHaveBeenCalledWith(id, {});

      expect(usersServiceMock.updateLastLoginAt).toHaveBeenCalledWith(id, expect.any(Date));

      expect(result.access.accessToken).toEqual(accessToken);
      expect(result.refresh.expiresAt.getTime()).toEqual(expiresAt.getTime());
      expect(result.refresh.sessionId).toEqual(sessionId);
      expect(result.refresh.token).toEqual(token);
      expect(result.user).toEqual({ id, role });
    });
  });

  // -------------------------------
  // ----------- SIGN IN -----------
  // -------------------------------

  describe('signIn', () => {
    // --- USER DOES NOT EXIST ---
    it('throws Unauthorized when user does not exist', async () => {
      usersServiceMock.findAuthUserByEmail.mockResolvedValue(null);

      await expect(authService.signIn('example@example.com', 'example123', {})).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.createSession).not.toHaveBeenCalled();
    });

    // --- USER IS NOT ACTIVE ---
    it('throws Unauthorized when user is not active', async () => {
      usersServiceMock.findAuthUserByEmail.mockResolvedValue(
        makeAuthUser({
          passwordHash: await makePasswordHash(),
          isActive: false,
        }),
      );

      await expect(authService.signIn('example@example.com', 'example123', {})).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.createSession).not.toHaveBeenCalled();
    });

    // --- WRONG PASSWORD ---
    it('throws Unauthorized when user passes wrong password', async () => {
      usersServiceMock.findAuthUserByEmail.mockResolvedValue(
        makeAuthUser({
          passwordHash: await makePasswordHash(),
        }),
      );

      await expect(authService.signIn('example@example.com', 'exampleWrong', {})).rejects.toThrow(
        InvalidCredentialsException,
      );

      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.createSession).not.toHaveBeenCalled();
    });

    // --- HAPPY PATH ---
    it('returns access token, refresh session and user data for valid credentials', async () => {
      const expiresAt = new Date();
      // mocks
      usersServiceMock.findAuthUserByEmail.mockResolvedValue(
        makeAuthUser({
          passwordHash: await makePasswordHash(),
        }),
      );

      authTokenServiceMock.issueAccessToken.mockResolvedValue({
        accessToken: 'access_token',
      });

      refreshSessionServiceMock.createSession.mockResolvedValue({
        refresh: {
          expiresAt,
          sessionId: 'session-1',
          token: 'new-session-token',
        },
      });

      const result = await authService.signIn('example@example.com', 'example123', {});

      // assertions
      expect(usersServiceMock.findAuthUserByEmail).toHaveBeenCalledWith('example@example.com');
      expect(usersServiceMock.findAuthUserByEmail).toHaveBeenCalledTimes(1);
      expect(authTokenServiceMock.issueAccessToken).toHaveBeenCalledWith({
        id: '1',
        role: Role.ADMIN,
      });
      expect(refreshSessionServiceMock.createSession).toHaveBeenCalledWith('1', {});

      // results
      expect(result.user).toEqual({ id: '1', role: Role.ADMIN });
      expect(result.access).toEqual({ accessToken: 'access_token' });
      expect(result.refresh).toEqual({
        expiresAt,
        sessionId: 'session-1',
        token: 'new-session-token',
      });
    });
  });

  // -------------------------------
  // ---- ROTATE REFRESH TOKEN -----
  // -------------------------------

  describe('refreshRotate', () => {
    // --- ROTATED USER DOES NOT EXIST ---
    it('throws Unauthorized when rotated user does not exist', async () => {
      const expiresAt = new Date();

      usersServiceMock.findJwtUserById.mockResolvedValue(null);

      refreshSessionServiceMock.rotateSession.mockResolvedValue({
        userId: '1',
        refresh: {
          token: 'new-refresh-session',
          sessionId: 'session-2',
          expiresAt,
        },
      });

      await expect(authService.refreshRotate('session-1', 'access_token', {})).rejects.toThrow(
        InactiveAccountException,
      );

      expect(refreshSessionServiceMock.revokeAll).toHaveBeenCalledWith('1', expect.any(Date));
      expect(usersServiceMock.findJwtUserById).toHaveBeenCalledWith('1');
      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
    });

    // --- ROTATED USER IS NOT ACTIVE ---
    it('throws Unauthorized when rotated user is not active', async () => {
      usersServiceMock.findJwtUserById.mockResolvedValue(
        makeJwtUser({
          isActive: false,
        }),
      );

      refreshSessionServiceMock.rotateSession.mockResolvedValue({
        userId: '1',
        refresh: {
          token: 'new-refresh-session',
          sessionId: 'session-2',
          expiresAt: new Date(),
        },
      });

      await expect(authService.refreshRotate('session-2', '123avzxd', {})).rejects.toThrow(
        InvalidRefreshTokenException,
      );

      expect(refreshSessionServiceMock.revokeAll).toHaveBeenCalledWith('1', expect.any(Date));
      expect(usersServiceMock.findJwtUserById).toHaveBeenCalledWith('1');
      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
    });

    // --- REFRESH ROTATE EXCEPTION ---
    it('rethrows when refreshRotate fails', async () => {
      refreshSessionServiceMock.rotateSession.mockRejectedValue(new InvalidRefreshTokenException());

      await expect(authService.refreshRotate('session-1', 'wrong-token', {})).rejects.toThrow(
        InvalidRefreshTokenException,
      );

      expect(usersServiceMock.findJwtUserById).not.toHaveBeenCalled();
      expect(authTokenServiceMock.issueAccessToken).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.revokeAll).not.toHaveBeenCalled();
    });

    // --- HAPPY PATH ---
    it('returns access token, refresh session and user data for valid rotated session', async () => {
      const expiresAt = new Date();

      // mocks
      usersServiceMock.findJwtUserById.mockResolvedValue(makeJwtUser());

      refreshSessionServiceMock.rotateSession.mockResolvedValue({
        userId: '1',
        refresh: {
          token: 'new-refresh-session',
          sessionId: 'session-2',
          expiresAt,
        },
      });

      authTokenServiceMock.issueAccessToken.mockResolvedValue({
        accessToken: 'access_example',
      });

      const result = await authService.refreshRotate('session-2', 'new-refresh-session', {});

      // assertions
      expect(usersServiceMock.findJwtUserById).toHaveBeenCalledWith('1');

      expect(authTokenServiceMock.issueAccessToken).toHaveBeenCalledWith({
        id: '1',
        role: Role.ADMIN,
      });
      expect(refreshSessionServiceMock.rotateSession).toHaveBeenCalledWith(
        'session-2',
        'new-refresh-session',
        {},
      );

      // results
      expect(result.user).toEqual({ id: '1', role: Role.ADMIN });
      expect(result.access).toEqual({ accessToken: 'access_example' });
      expect(result.refresh).toEqual({
        expiresAt,
        sessionId: 'session-2',
        token: 'new-refresh-session',
      });
    });
  });

  // -------------------------------
  // ----------- LOGOUT ------------
  // -------------------------------

  describe('logout', () => {
    it('expects to call revokeSession', async () => {
      await authService.logout('session-1');
      expect(refreshSessionServiceMock.revokeSession).toHaveBeenCalledWith(
        'session-1',
        expect.any(Date),
      );
    });
  });

  // -------------------------------
  // ---------- LOGOUT ALL ---------
  // -------------------------------

  describe('logoutAll', () => {
    it('expects to call revokeAll', async () => {
      await authService.logoutAll('1');

      expect(refreshSessionServiceMock.revokeAll).toHaveBeenCalledWith('1', expect.any(Date));
    });
  });
});
