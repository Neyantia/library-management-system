import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { BooksService } from '../../catalog/services/books.service.js';
import { BorrowingsService } from '../../borrowings/services/borrowings.service.js';

import { CreateReviewDto } from '../dto/create-review.dto.js';

import { ReviewAlreadyExistsException } from '../exceptions/review-already-exists.exception.js';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private booksService: BooksService,
    private borrowingsService: BorrowingsService,
  ) {}

  async addReview(userId: string, bookId: string, createReviewDto: CreateReviewDto) {
    const { rating, content } = createReviewDto;

    // check if users exists and is active
    await this.usersService.getActiveAuthUserById(userId);

    // check if book exists and is active
    await this.booksService.getActiveBookById(bookId);

    // check if user have aver borrowed this book and returned it
    await this.borrowingsService.ensureUserReturnedBook(userId, bookId);

    // check if user have already create review for this book
    const existingReview = await this.prisma.review.findFirst({ where: { userId, bookId } });

    if (existingReview) {
      throw new ReviewAlreadyExistsException();
    }

    const trimmedContent = content ? content?.trim() : null;

    // create review
    try {
      return await this.prisma.review.create({
        data: {
          userId,
          bookId,
          rating,
          content: trimmedContent,
        },
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          bookId: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ReviewAlreadyExistsException();
      }

      throw error;
    }
  }
}
