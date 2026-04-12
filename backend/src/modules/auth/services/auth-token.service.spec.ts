import { Test } from '@nestjs/testing';
import { Role } from '../../../prisma/prisma.types.js';

import { AuthTokenService } from './auth-token.service.js';
import { JwtService } from '@nestjs/jwt';

import { createJwtServiceMock } from '../../../../test/mocks/jwt.service.mock.js';

// ----- TESTS -----
describe('AuthTokenService', () => {
  let authTokenService: AuthTokenService;
  let jwtServiceMock: jest.Mocked<JwtService>;

  beforeEach(async () => {
    jwtServiceMock = createJwtServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [AuthTokenService, { provide: JwtService, useValue: jwtServiceMock }],
    }).compile();

    authTokenService = moduleRef.get(AuthTokenService);
  });

  describe('constructor', () => {
    it('should create authTokenService', () => {
      expect(authTokenService).toBeDefined();
    });
  });

  // -------------------------------
  // ----- ISSUE ACCESS TOKEN ------
  // -------------------------------
  describe('issueAccessToken', () => {
    it('issues access token', async () => {
      jwtServiceMock.signAsync.mockResolvedValue('access_token');

      const result = await authTokenService.issueAccessToken({
        id: '1',
        role: Role.ADMIN,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: '1',
        role: Role.ADMIN,
        jti: expect.any(String),
      });

      expect(result).toEqual({
        accessToken: 'access_token',
      });
    });
  });
});
