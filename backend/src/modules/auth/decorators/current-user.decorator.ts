import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthUser } from '../types/jwt-auth-user.type.js';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext): JwtAuthUser | undefined => {
    const request = context.switchToHttp().getRequest<Request>();

    return request.user as JwtAuthUser;
  },
);
