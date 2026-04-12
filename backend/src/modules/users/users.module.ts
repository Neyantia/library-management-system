import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { UsersController } from './controllers/users.controller.js';
import { RefreshSessionService } from '../auth/services/refresh-session.service.js';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, RefreshSessionService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
