import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { UsersModule } from '../users/users.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';

import { BorrowingsService } from './services/borrowings.service.js';
import { BorrowingsCron } from './borrowings.cron.js';

import { BorrowingsController } from './controllers/borrowings.controller.js';

@Module({
  imports: [PrismaModule, UsersModule, CatalogModule],
  providers: [BorrowingsService, BorrowingsCron],
  exports: [BorrowingsService],
  controllers: [BorrowingsController],
})
export class BorrowingsModule {}
