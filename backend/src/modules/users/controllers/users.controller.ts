import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { minutes, Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtension,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Role } from '../../../prisma/prisma.types.js';
import { Roles } from '../../auth/roles/roles.decorator.js';
import { RolesGuard } from '../../auth/roles/roles.guard.js';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';

import type { JwtAuthUser } from '../../auth/types/jwt-auth-user.type.js';
import { UsersService } from '../services/users.service.js';

import { CreateUserDto } from '../dto/create-user.dto.js';
import { CreatedUserResponseDto } from '../dto/created-user-response.dto.js';
import { UserProfileDto } from '../dto/user-profile.dto.js';
import { UserListItemDto } from '../dto/user-list-item.dto.js';
import { UserDetailsDto } from '../dto/user-details.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UpdatePasswordDto } from '../dto/update-password.dto.js';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto.js';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';
import { ListUsersQueryDto } from '../dto/list-users-query.dto.js';
import { UsersListResponseDto } from '../dto/user-list-response.dto.js';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ################################
  // ############ USER ##############
  // ################################

  // ---------------------------
  // --------- ME (GET) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns information about the user.',
  })
  @ApiOkResponse({ description: 'User profile returned successfully', type: UserProfileDto })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtAuthUser): Promise<UserProfileDto> {
    const profile = await this.usersService.getUserProfile(user.userId);

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      role: profile.role,
    };
  }

  // ---------------------------
  // -------- ME (PATCH) -------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update current user profile',
    description: "Updates the current user's password. Requires currentPassword and newPassword.",
  })
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: UserProfileDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or no fields provided',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 60, ttl: minutes(1) } })
  async updateProfile(
    @CurrentUser() user: JwtAuthUser,
    @Body() body: UpdateUserDto,
  ): Promise<UserProfileDto> {
    const profile = await this.usersService.updateUser(user.userId, body.firstName, body.lastName);

    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      role: profile.role,
    };
  }

  // ---------------------------
  // ------- ME/PASSWORD -------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user password',
    description: 'Updates user password. Supported fields: currentPassword and newPassword.',
  })
  @ApiNoContentResponse({
    description: 'User password updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or no fields provided',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Throttle({
    short: { limit: 300, ttl: minutes(1) },
    medium: { limit: 1000, ttl: minutes(10) },
  })
  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(@CurrentUser() user: JwtAuthUser, @Body() body: UpdatePasswordDto) {
    await this.usersService.updateUserPassword(user.userId, body.currentPassword, body.newPassword);
  }

  // ################################
  // ############ ADMIN #############
  // ################################

  // ---------------------------
  // ------- CREATE USER -------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user. Accessible only to administrators.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserDetailsDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email is already in use',
    type: ErrorResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createUser(@Body() body: CreateUserDto): Promise<CreatedUserResponseDto> {
    const user = await this.usersService.createUserByAdmin({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  // ---------------------------
  // ----- LIST ALL USERS ------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Returns a paginated list of users. Supports search and filtering. Requires ADMIN role.',
  })
  @ApiOkResponse({
    description: 'Users returned successfully',
    type: UsersListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'ADMIN role required',
    type: ErrorResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'isActive', required: false, example: true })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async listUsers(@Query() query: ListUsersQueryDto): Promise<UsersListResponseDto> {
    const result = await this.usersService.getAllUsers(query);

    return {
      items: result.items.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      })),
      meta: result.meta,
    };
  }

  // ---------------------------
  // --- UPDATE USER STATUS ----
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user active status',
    description: 'Updates the active status of a user. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Target user id',
    example: 'ceae8333-47a6-462b-9920-2f0051example',
  })
  @ApiOkResponse({
    description: 'User status updated successfully',
    type: UserListItemDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions or cannot change own status',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiExtension('x-ROLES', ['ADMIN'])
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUserStatus(
    @CurrentUser() user: JwtAuthUser,
    @Param('id') id: string,
    @Body() body: UpdateUserStatusDto,
  ): Promise<UserListItemDto> {
    const updatedUser = await this.usersService.updateUserStatus(user.userId, id, body.isActive);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName ?? '',
      lastName: updatedUser.lastName ?? '',
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      lastLoginAt: updatedUser.lastLoginAt,
    };
  }

  // ---------------------------
  // ---- GET USER DETAILS ----
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user details',
    description: 'Returns detailed information about a user. Accessible only to administrators.',
  })
  @ApiParam({
    name: 'id',
    description: 'Target user id',
    example: 'ceae8333-47a6-462b-9920-2f0051example',
  })
  @ApiOkResponse({
    description: 'User details returned successfully',
    type: UserDetailsDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiExtension('x-ROLES', ['ADMIN'])
  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserDetails(@Param('id') id: string): Promise<UserDetailsDto> {
    const user = await this.usersService.getUserDetails(id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
    };
  }
}
