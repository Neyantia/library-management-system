import { Injectable, Logger } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { RefreshSessionService } from '../../auth/services/refresh-session.service.js';

import { Role } from '../../../prisma/prisma.types.js';
import { AuthUser } from '../types/auth-user.type.js';
import { JwtUser } from '../types/jwt-user.type.js';
import { CreatedUser } from '../types/created-user.type.js';
import { CreateUserInput } from '../types/create-user-input.type.js';
import { ListUsersQueryDto } from '../dto/list-users-query.dto.js';

import { UserNotFoundException } from '../exceptions/user-not-found.exception.js';
import { EmptyProfileUpdateException } from '../exceptions/empty-profile-update.exception.js';
import { WrongPasswordException } from '../exceptions/wrong-password-exception.js';
import { NewPasswordMustBeDifferentException } from '../exceptions/new-password-must-be-different.exception.js';
import { CannotChangeOwnStatusException } from '../exceptions/cannot-change-own-status.exception.js';
import { EmailAlreadyInUseException } from '../../auth/exceptions/email-already-in-use.exception.js';
import { UserInactiveException } from '../exceptions/user-inactive.exception.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private refreshSession: RefreshSessionService,
  ) {}

  // ################################
  // ########### COMMON #############
  // ################################

  // ---------------------------
  // ------- CREATE USER -------
  // ---------------------------

  async createUser(data: CreateUserInput): Promise<CreatedUser> {
    const user = await this.findAuthUserByEmail(data.email);

    if (user) throw new EmailAlreadyInUseException();

    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
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
  }

  // ---------------------------
  // ------ FIND BY EMAIL ------
  // ---------------------------

  async findAuthUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!user) return null;

    return user;
  }

  // ---------------------------
  // -------- FIND BY ID -------
  // ---------------------------

  async findJwtUserById(userId: string): Promise<JwtUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2007' || error.code === 'P2023')
      ) {
        this.logger.warn(`Invalid user id format: ${userId}`);
        return null;
      }

      throw error;
    }
  }

  // -----------------------------
  // --- FIND ACTIVE USER BY ID --
  // -----------------------------

  // TODO ADD TESTS

  async getActiveAuthUserById(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      if (!user.isActive) {
        throw new UserInactiveException();
      }

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2007' || error.code === 'P2023')
      ) {
        this.logger.warn(`Invalid user id format: ${userId}`);
        throw new UserNotFoundException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ---- UPDATE LAST LOGIN ----
  // ---------------------------

  async updateLastLoginAt(userId: string, date: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: date },
      select: { id: true },
    });
  }

  // ################################
  // ############ USER ##############
  // ################################

  // ---------------------------
  // ------- GET PROFILE -------
  // ---------------------------

  async getUserProfile(userId: string) {
    try {
      const profile = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      if (!profile) throw new UserNotFoundException();

      return profile;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2007' || error.code === 'P2023')
      ) {
        this.logger.warn(`Invalid user id format: ${userId}`);
        throw new UserNotFoundException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ----- UPDATE PROFILE ------
  // ---------------------------

  async updateUser(userId: string, firstName?: string, lastName?: string) {
    // trim inputs
    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();

    const updateData: {
      firstName?: string | null;
      lastName?: string | null;
    } = {};

    // set to null if input is empty
    if (firstName !== undefined) {
      updateData.firstName = trimmedFirstName === '' ? null : trimmedFirstName;
    }

    if (lastName !== undefined) {
      updateData.lastName = trimmedLastName === '' ? null : trimmedLastName;
    }

    // throw empty profil update exception if both inputs are empty
    if (Object.keys(updateData).length === 0) {
      this.logger.warn('Empty profile update attempt', { userId });
      throw new EmptyProfileUpdateException();
    }

    try {
      // update user profile
      return await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2025' || error.code === 'P2007')
      ) {
        this.logger.warn(`User not found during profile update: ${userId}`);
        throw new UserNotFoundException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ----- UPDATE PASSWORD -----
  // ---------------------------

  async updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // get user by id
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      // check if the user exist
      if (!user) throw new UserNotFoundException();

      // compare current password with DB
      const isPasswordMatch = await verify(user.passwordHash, currentPassword);

      if (!isPasswordMatch) {
        this.logger.warn(`Invalid current password while changing password for user ${userId}`);
        throw new WrongPasswordException();
      }

      // compare new password with the new one
      const isTheSamePassword = await verify(user.passwordHash, newPassword);

      if (isTheSamePassword) throw new NewPasswordMustBeDifferentException();

      // hash new password
      const newPasswordHash = await hash(newPassword);

      // update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // revoke all sessions
      await this.refreshSession.revokeAll(userId, new Date());

      // NOTE:
      // Currently revokes all sessions after password change.
      // Possible improvement: keep current session (sid) and revoke others only.

      return;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2025' || error.code === 'P2007')
      ) {
        this.logger.warn(`User not found during password update: ${userId}`);
        throw new UserNotFoundException();
      }

      throw error;
    }
  }

  // ################################
  // ############ ADMIN #############
  // ################################

  // ---------------------------
  // -- CREATE USER BY ADMIN ---
  // ---------------------------

  async createUserByAdmin(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: Role;
  }): Promise<CreatedUser> {
    const passwordHash = await hash(data.password);

    return this.createUser({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });
  }

  // ---------------------------
  // ----- LIST ALL USERS ------
  // ---------------------------

  async getAllUsers(query: ListUsersQueryDto) {
    // get params
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const search = query.search;
    const role = query.role;
    const isActive = query.isActive;

    const where: Prisma.UserWhereInput = {};

    // build where object
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // transaction to get paginated and filtered users
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------
  // --- UPDATE USER STATUS ----
  // ---------------------------

  async updateUserStatus(currentUserId: string, targetUserId: string, isActive: boolean) {
    //  check if user try to change own status
    if (currentUserId === targetUserId) throw new CannotChangeOwnStatusException();

    try {
      // update user status
      const user = await this.prisma.user.update({
        where: { id: targetUserId },
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

      // revoke all sessions
      if (!isActive) await this.refreshSession.revokeAll(user.id, new Date());

      // return result
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2025' || error.code === 'P2007')
      ) {
        this.logger.warn(`User not found during status update: ${targetUserId}`);
        throw new UserNotFoundException();
      }
      // NOTE:
      // Possible improvement: throw different exception for P2007 error - 400 invalid user id format

      throw error;
    }
  }

  // ---------------------------
  // ----- GET USER DETAILS ----
  // ---------------------------

  async getUserDetails(userId: string) {
    // update user status

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`User not found during getting user details: ${userId}`);
        throw new UserNotFoundException();
      }

      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2007' || error.code === 'P2023')
      ) {
        this.logger.warn(`Invalid user id format: ${userId}`);
        throw new UserNotFoundException();
      }

      throw error;
    }
  }
}
