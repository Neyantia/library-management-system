import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';

import { AuthorsService } from './services/authors.service.js';
import { BooksService } from './services/books.service.js';
import { CategoriesService } from './services/categories.service.js';

import { AuthorsController } from './controllers/authors.controller.js';
import { BooksController } from './controllers/books.controller.js';
import { CategoriesController } from './controllers/categories.controller.js';

@Module({
  imports: [PrismaModule],
  providers: [AuthorsService, BooksService, CategoriesService],
  exports: [AuthorsService, BooksService, CategoriesService],
  controllers: [AuthorsController, BooksController, CategoriesController],
})
export class CatalogModule {}
