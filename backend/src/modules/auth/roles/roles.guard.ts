import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PrismaService } from '../../../prisma/prisma.service.js';
import type { Role } from 'src/prisma/prisma.types.js';
import { ROLES_KEY } from './roles.decorator.js';
import { JwtAuthUser } from '../types/jwt-auth-user.type.js';

import { InsufficientPermissionsException } from '../../../common/exceptions/insufficient-permissions.exception.js';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception.js';
import { UserInactiveException } from '../../users/exceptions/user-inactive.exception.js';
import { UnauthorizedAppException } from '../../../common/exceptions/unauthorized-app.exception.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || !requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authUser = request.user as JwtAuthUser | undefined;

    if (!authUser) throw new UnauthorizedAppException();

    const user = await this.prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true, isActive: true },
    });

    if (!user) throw new UserNotFoundException();

    if (!user.isActive) throw new UserInactiveException();

    if (!requiredRoles.includes(user.role)) {
      throw new InsufficientPermissionsException();
    }

    return true;
  }
}
