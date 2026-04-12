import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';

import { UsersModule } from '../users/users.module.js';
import { ReviewsService } from './services/reviews.service.js';
import { ReviewsController } from './controllers/reviews.controller.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { BorrowingsModule } from '../borrowings/borrowings.module.js';

@Module({
  imports: [PrismaModule, UsersModule, CatalogModule, BorrowingsModule],
  providers: [ReviewsService],
  exports: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
