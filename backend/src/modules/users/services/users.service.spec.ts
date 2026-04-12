import { Test } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { makeAuthUser } from '../../../../test/helpers/unit-helpers.js';

import { UsersService } from './users.service.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import { Role } from '../../../prisma/prisma.types.js';

import { RefreshSessionService } from '../../auth/services/refresh-session.service.js';
import { createRefreshSessionServiceMock } from '../../../../test/mocks/refresh-session.service.mock.js';
import { createPrismaServiceMock } from '../../../../test/mocks/prisma.service.mock.js';

import { EmailAlreadyInUseException } from '../../auth/exceptions/email-already-in-use.exception.js';
import { UserNotFoundException } from '../exceptions/user-not-found.exception.js';
import { EmptyProfileUpdateException } from '../exceptions/empty-profile-update.exception.js';
import { WrongPasswordException } from '../exceptions/wrong-password-exception.js';
import { NewPasswordMustBeDifferentException } from '../exceptions/new-password-must-be-different.exception.js';
import { CannotChangeOwnStatusException } from '../exceptions/cannot-change-own-status.exception.js';

const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
  code: 'P2025',
  clientVersion: 'test',
});

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaServiceMock: jest.Mocked<PrismaService>;
  let refreshSessionServiceMock: jest.Mocked<RefreshSessionService>;

  beforeEach(async () => {
    prismaServiceMock = createPrismaServiceMock();
    refreshSessionServiceMock = createRefreshSessionServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: RefreshSessionService, useValue: refreshSessionServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    usersService = moduleRef.get(UsersService);

    jest.clearAllMocks();
  });

  // ========================
  // ==== USERS SERVICE =====
  // ========================

  describe('constructor', () => {
    // --- USERS SERVICE CREATED ---
    it('should create usersService', () => {
      expect(usersService).toBeDefined();
    });
  });

  // ---------------------------
  // ------- CREATE USER -------
  // ---------------------------

  describe('createUser', () => {
    // --- EMAIL ALREADY IN USE ---
    it('throws EmailAlreadyInUseException if email is already in use', async () => {
      const email = 'test@example.com';

      prismaServiceMock.user.findUnique.mockResolvedValue(makeAuthUser());

      await expect(
        usersService.createUser({
          email,
          passwordHash: 'new-hash',
        }),
      ).rejects.toThrow(EmailAlreadyInUseException);

      expect(prismaServiceMock.user.create).not.toHaveBeenCalled();
    });

    // --- HAPPY PATH ---
    it('creates user when email is not in use', async () => {
      const email = 'test@example.com';
      const passwordHash = 'hashed-password';

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      prismaServiceMock.user.create.mockResolvedValue(makeAuthUser({ email, passwordHash }));

      const result = await usersService.createUser({
        email,
        passwordHash,
      });

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalled();
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email,
          passwordHash,
          firstName: undefined,
          lastName: undefined,
          role: undefined,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      expect(result.email).toEqual(email);
    });
  });

  // ---------------------------
  // ------ FIND BY EMAIL ------
  // ---------------------------

  describe('findAuthUserByEmail', () => {
    // --- USER DOES NOT EXIST ---
    it('returns null if user does not exist', async () => {
      const email = 'user@example.com';
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findAuthUserByEmail(email);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
      });

      expect(result).toEqual(null);
    });

    // --- HAPPY PATH ---
    it('returns user if exists', async () => {
      const email = 'test@example.com';
      const passwordHash = 'hashed-password';
      const user = makeAuthUser({ email, passwordHash });

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await usersService.findAuthUserByEmail(email);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
      });

      expect(result?.id).toEqual(user.id);
      expect(result?.email).toEqual(user.email);
      expect(result?.isActive).toEqual(user.isActive);
      expect(result?.passwordHash).toEqual(user.passwordHash);
      expect(result?.role).toEqual(user.role);
    });
  });

  // ---------------------------
  // -------- FIND BY ID -------
  // ---------------------------

  describe('findJwtUserById', () => {
    // --- USER DOES NOT EXIST ---
    it('returns null if userId does not exist', async () => {
      const id = '1';
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findJwtUserById(id);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      expect(result).toEqual(null);
    });

    // --- HAPPY PATH ---
    it('returns user if exists', async () => {
      const email = 'test@example.com';
      const passwordHash = 'hashed-password';
      const user = makeAuthUser({ email, passwordHash });

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await usersService.findJwtUserById(user.id);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      expect(result?.id).toEqual(user.id);
      expect(result?.email).toEqual(user.email);
      expect(result?.isActive).toEqual(user.isActive);
      expect(result?.role).toEqual(user.role);
    });
  });

  // ---------------------------
  // ---- UPDATE LAST LOGIN ----
  // ---------------------------

  describe('updateLastLoginAt', () => {
    // --- HAPPY PATH ---
    it('updates user status and return user id', async () => {
      const now = new Date();
      const email = 'test@example.com';
      const passwordHash = 'hashed-password';
      const user = makeAuthUser({ email, passwordHash });

      prismaServiceMock.user.update.mockResolvedValue(user);

      const result = await usersService.updateLastLoginAt(user.id, now);

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { lastLoginAt: now },
        select: {
          id: true,
        },
      });

      expect(result.id).toEqual(user.id);
    });
  });

  // ---------------------------
  // ------- GET PROFILE -------
  // ---------------------------

  describe('getUserProfile', () => {
    // --- USER DOES NOT EXIST ---
    it('throws UserNotFoundException if user does not exist', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.getUserProfile('123')).rejects.toThrow(UserNotFoundException);
    });

    // --- HAPPY PATH ---
    it('returns user profile', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        role: Role.ADMIN,
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await usersService.getUserProfile(user.id);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      expect(result.id).toEqual(user.id);
      expect(result.email).toEqual(user.email);
      expect(result.firstName).toBeNull();
      expect(result.lastName).toBeNull();
      expect(result.role).toEqual(user.role);
    });
  });

  // ---------------------------
  // ----- UPDATE PROFILE ------
  // ---------------------------

  describe('updateUser', () => {
    // --- USER DOES NOT EXIST ---
    it('throws UserNotFoundException if user does not exist', async () => {
      prismaServiceMock.user.update.mockRejectedValue(prismaError);

      await expect(usersService.updateUser('123', 'New', 'User')).rejects.toThrow(
        UserNotFoundException,
      );
    });

    // --- EMPTY ALL INPUTS ---
    it('throws EmptyProfileUpdateException if both inputs are empty', async () => {
      await expect(usersService.updateUser('123')).rejects.toThrow(EmptyProfileUpdateException);

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
    });

    // --- ONE INPUT EMPTY ---
    it('sets firstName to null when empty string is provided', async () => {
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: null,
        lastName: 'Userski',
        role: Role.ADMIN,
      };

      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      const result = await usersService.updateUser('1', '', 'Userski');

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          firstName: null,
          lastName: 'Userski',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      expect(result.firstName).toBeNull();
    });

    // --- HAPPY PATH ---
    it('updates user profile and returns user data', async () => {
      const updatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'Userski',
        role: Role.ADMIN,
      };

      prismaServiceMock.user.update.mockResolvedValue(updatedUser);

      const result = await usersService.updateUser('1', 'Updated', 'Userski');

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          firstName: 'Updated',
          lastName: 'Userski',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      expect(result).toEqual(updatedUser);
    });
  });

  // ---------------------------
  // ----- UPDATE PASSWORD -----
  // ---------------------------

  describe('updateUserPassword', () => {
    // --- USER DOES NOT EXIST ---
    it('throws UserNotFoundException if user does not exist', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.updateUserPassword('123', 'currentpass', 'newpass'),
      ).rejects.toThrow(UserNotFoundException);

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.revokeAll).not.toHaveBeenCalled();
    });

    // --- CURRENT PASSWORD IS INVALID ---
    it('throws WrongPasswordException if current password is invalid', async () => {
      const user = makeAuthUser();

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      await expect(
        usersService.updateUserPassword(user.id, 'wrongpass', 'newpass'),
      ).rejects.toThrow(WrongPasswordException);

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.revokeAll).not.toHaveBeenCalled();
    });

    // --- CURRENT AND NEW PASSWORDS ARE THE SAME ---
    it('throws NewPasswordMustBeDifferentException if new and current password are the same', async () => {
      const user = makeAuthUser();

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      await expect(
        usersService.updateUserPassword(user.id, 'Testy123!', 'Testy123!'),
      ).rejects.toThrow(NewPasswordMustBeDifferentException);

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.revokeAll).not.toHaveBeenCalled();
    });

    // --- HAPPY PATH ---
    it('updates user password and revokes all sessions', async () => {
      const user = makeAuthUser();

      prismaServiceMock.user.findUnique.mockResolvedValue(user);
      prismaServiceMock.user.update.mockResolvedValue(undefined);

      await usersService.updateUserPassword(user.id, 'Testy123!', 'Strong123!');

      expect(prismaServiceMock.user.update).toHaveBeenCalled();
      expect(refreshSessionServiceMock.revokeAll).toHaveBeenCalledWith(user.id, expect.any(Date));
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { passwordHash: expect.any(String) },
      });

      const passedHash = prismaServiceMock.user.update.mock.calls[0][0].data.passwordHash;
      expect(passedHash).not.toBe('Strong123!');
    });
  });

  // ---------------------------
  // -- CREATE USER BY ADMIN ---
  // ---------------------------

  describe('createUserByAdmin', () => {
    // --- HAPPY PATH ---
    it('creates user and returns user data', async () => {
      const createdUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'New',
        lastName: 'User',
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(null);
      prismaServiceMock.user.create.mockResolvedValue(createdUser);

      const result = await usersService.createUserByAdmin({
        email: createdUser.email,
        password: 'Testy123!',
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
      });

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: createdUser.email },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
      });

      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: createdUser.email,
          passwordHash: expect.any(String),
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          role: undefined,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          lastLoginAt: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const passedHash = prismaServiceMock.user.create.mock.calls[0][0].data.passwordHash;
      expect(passedHash).toEqual(expect.any(String));
      expect(passedHash).not.toBe('Testy123!');

      expect(result.id).toEqual(createdUser.id);
      expect(result.email).toEqual(createdUser.email);
      expect(result.firstName).toEqual(createdUser.firstName);
      expect(result.lastName).toEqual(createdUser.lastName);
      expect(result.role).toEqual(createdUser.role);
      expect(result.isActive).toEqual(createdUser.isActive);
      expect(result.createdAt).toEqual(createdUser.createdAt);
    });
  });

  // ---------------------------
  // ------ LIST ALL USERS -----
  // ---------------------------

  describe('getAllUsers', () => {
    // --- DEFAULT PAGINATION ---
    it('returns users with default page and limit', async () => {
      const users = [
        {
          id: '1',
          email: 'u1@example.com',
          firstName: null,
          lastName: null,
          role: Role.USER,
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: null,
        },
        {
          id: '2',
          email: 'u2@example.com',
          firstName: null,
          lastName: null,
          role: Role.USER,
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: null,
        },
      ];

      prismaServiceMock.$transaction.mockResolvedValue([users, 2]);

      const result = await usersService.getAllUsers({});

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      expect(prismaServiceMock.user.count).toHaveBeenCalledWith({
        where: {},
      });

      expect(result).toEqual({
        items: users,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    // --- CUSTOM PAGE AND LIMIT ---
    it('returns users with custom page and limit', async () => {
      const users = [
        {
          id: '3',
          email: 'u3@example.com',
          firstName: null,
          lastName: null,
          role: Role.USER,
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: null,
        },
      ];

      prismaServiceMock.$transaction.mockResolvedValue([users, 5]);

      const result = await usersService.getAllUsers({
        page: 2,
        limit: 2,
      });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 2,
        take: 2,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      expect(result.meta).toEqual({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
      });
    });

    // --- SEARCH FILTER ---
    it('builds where with search filter', async () => {
      prismaServiceMock.$transaction.mockResolvedValue([[], 0]);

      await usersService.getAllUsers({
        search: 'john',
      });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      expect(prismaServiceMock.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
          ],
        },
      });
    });

    // --- ROLE FILTER ---
    it('builds where with role filter', async () => {
      prismaServiceMock.$transaction.mockResolvedValue([[], 0]);

      await usersService.getAllUsers({
        role: Role.ADMIN,
      });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {
          role: Role.ADMIN,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
    });

    // --- ISACTIVE FILTER ---
    it('builds where with isActive filter', async () => {
      prismaServiceMock.$transaction.mockResolvedValue([[], 0]);

      await usersService.getAllUsers({
        isActive: false,
      });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: false,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });
    });

    // --- COMBINED FILTERS ---
    it('builds where with search, role and isActive filters', async () => {
      prismaServiceMock.$transaction.mockResolvedValue([[], 0]);

      await usersService.getAllUsers({
        search: 'john',
        role: Role.ADMIN,
        isActive: true,
        page: 3,
        limit: 5,
      });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
          ],
          role: Role.ADMIN,
          isActive: true,
        },
        skip: 10,
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      expect(prismaServiceMock.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
          ],
          role: Role.ADMIN,
          isActive: true,
        },
      });
    });

    // --- EMPTY RESULT ---
    it('returns empty items and zero totals when no users are found', async () => {
      prismaServiceMock.$transaction.mockResolvedValue([[], 0]);

      const result = await usersService.getAllUsers({});

      expect(result).toEqual({
        items: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  // ---------------------------
  // --- UPDATE USER STATUS ----
  // ---------------------------

  describe('updateUserStatus', () => {
    // --- CHANGE OWN STATUS ---
    it('throws CannotChangeOwnStatusException if user wants to change its own status', async () => {
      const user = makeAuthUser();

      await expect(usersService.updateUserStatus(user.id, user.id, true)).rejects.toThrow(
        CannotChangeOwnStatusException,
      );

      expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
      expect(refreshSessionServiceMock.revokeAll).not.toHaveBeenCalled();
    });

    // --- USER DOES NOT EXIST ---
    it('throws UserNotFoundException if user does not exist', async () => {
      prismaServiceMock.user.update.mockRejectedValue(prismaError);

      await expect(usersService.updateUserStatus('adminid', 'userid', true)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    // --- HAPPY PATH - ACTIVE ---
    it('changes user status to active', async () => {
      const admin = makeAuthUser({ role: Role.ADMIN });
      const isActive = true;
      const user = {
        id: '11',
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        role: Role.ADMIN,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      prismaServiceMock.user.update.mockResolvedValue(user);

      const result = await usersService.updateUserStatus(admin.id, user.id, isActive);

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      expect(result).toEqual(user);

      expect(refreshSessionServiceMock.revokeAll).not.toHaveBeenCalled();
    });

    // --- HAPPY PATH - INACTIVE ---
    it('changes user status to inactive and revokes all sessions', async () => {
      const admin = makeAuthUser({ role: Role.ADMIN });
      const isActive = false;
      const user = {
        id: '11',
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        role: Role.ADMIN,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      prismaServiceMock.user.update.mockResolvedValue(user);

      const result = await usersService.updateUserStatus(admin.id, user.id, isActive);

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      expect(result).toEqual(user);

      expect(refreshSessionServiceMock.revokeAll).toHaveBeenCalledWith(user.id, expect.any(Date));
    });
  });

  // ---------------------------
  // ----- GET USER DETAILS ----
  // ---------------------------

  describe('getUserDetails', () => {
    // --- USER DOES NOT EXIST ---
    it('throws UserNotFoundException if user does not exist', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.getUserDetails('123')).rejects.toThrow(UserNotFoundException);
    });

    // --- HAPPY PATH ---
    it('returns user profile with details', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        role: Role.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(user);

      const result = await usersService.getUserDetails(user.id);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      expect(result).toEqual(user);
    });
  });
});
