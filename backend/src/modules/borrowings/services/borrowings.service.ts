import { Injectable } from '@nestjs/common';
import { BookStatus, BorrowingStatus } from '../../../prisma/prisma.types.js';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { UsersService } from '../../users/services/users.service.js';
import { BooksService } from '../../catalog/services/books.service.js';

import { BorrowBookDto } from '../dto/borrow-book.dto.js';
import { BorrowBooksDto } from '../dto/borrow-books.dto.js';

import { BorrowingNotFoundException } from '../exceptions/borrowing-not-found.exception.js';
import { NoAvailableCopiesException } from '../exceptions/no-available-copies.extension.js';
import { BorrowingInactiveException } from '../exceptions/borrowing-inactive.exception.js';
import { BookNotBorrowedException } from '../exceptions/book-not-borrowed.exception.js';

const borrowingSelect = {
  id: true,
  status: true,
  borrowedAt: true,
  dueDate: true,
  returnedAt: true,
  bookCopy: {
    select: {
      inventoryNumber: true,
      status: true,
      book: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
};

@Injectable()
export class BorrowingsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private booksService: BooksService,
  ) {}

  // ----------------------------
  // -------- BORROW BOOK -------
  // ----------------------------

  async borrowBook(userId: string, borrowBookDto: BorrowBookDto) {
    const bookId = borrowBookDto.bookId;

    // check if user exists and is active
    await this.usersService.getActiveAuthUserById(userId);

    // check if book exists and is active
    await this.booksService.getActiveBookById(bookId);

    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days

    const borrowingId = await this.prisma.$transaction(async (tx) => {
      const copyToBorrow = await tx.bookCopy.findFirst({
        where: { bookId, status: BookStatus.AVAILABLE },
        orderBy: { inventoryNumber: 'asc' },
        select: { id: true },
      });

      if (!copyToBorrow) {
        throw new NoAvailableCopiesException();
      }

      // create borrowing
      const createdBorrowing = await tx.borrowing.create({
        data: {
          userId,
          bookCopyId: copyToBorrow.id,
          borrowedAt,
          dueDate,
          status: BorrowingStatus.ACTIVE,
        },
        select: { id: true },
      });

      // update book copy status
      await tx.bookCopy.update({
        where: { id: copyToBorrow.id },
        data: { status: BookStatus.BORROWED },
      });

      return createdBorrowing.id;
    });

    return this.getBorrowingDetails(borrowingId);
  }

  // ----------------------------
  // ------- BORROW BOOKS -------
  // ----------------------------

  async borrowBooks(userId: string, borrowBooksDto: BorrowBooksDto) {
    const bookIds = borrowBooksDto.bookIds;
    // check if user exists and is active
    await this.usersService.getActiveAuthUserById(userId);

    // check if all books exist and are active
    await Promise.all(bookIds.map((bookId) => this.booksService.getActiveBookById(bookId)));

    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt);
    dueDate.setDate(dueDate.getDate() + 14); // 14 days

    const borrowingIds = await this.prisma.$transaction(async (tx) => {
      const copiesToBorrow: Array<{ bookId: string; bookCopyId: string }> = [];
      // choose book copies to borrow
      for (const bookId of bookIds) {
        const copyToBorrow = await tx.bookCopy.findFirst({
          where: { bookId, status: BookStatus.AVAILABLE },
          orderBy: { inventoryNumber: 'asc' },
          select: { id: true, bookId: true },
        });

        if (!copyToBorrow) {
          throw new NoAvailableCopiesException();
        }

        copiesToBorrow.push({ bookId: copyToBorrow.bookId, bookCopyId: copyToBorrow.id });
      }

      const createdBorrowingIds: string[] = [];

      // create borrowings for each book
      for (const copyToBorrow of copiesToBorrow) {
        const createdBorrowing = await tx.borrowing.create({
          data: {
            userId,
            bookCopyId: copyToBorrow.bookCopyId,
            borrowedAt,
            dueDate,
            status: BorrowingStatus.ACTIVE,
          },
          select: { id: true },
        });

        createdBorrowingIds.push(createdBorrowing.id);
      }

      // update books status
      // update book copy status
      await tx.bookCopy.updateMany({
        where: { id: { in: copiesToBorrow.map((copy) => copy.bookCopyId) } },
        data: { status: BookStatus.BORROWED },
      });

      return createdBorrowingIds;
    });

    return this.getBorrowingsDetails(borrowingIds);
  }

  // ----------------------------
  // -------- RETURN BOOK -------
  // ----------------------------

  async returnBook(userId: string, borrowingId: string) {
    // check if user exists and is active
    await this.usersService.getActiveAuthUserById(userId);

    // check if borrowing exists and is active
    const borrowing = await this.getActiveBorrowingById(borrowingId);

    // if borrowing does not belong to the user throw exception
    if (borrowing.userId !== userId) {
      throw new BorrowingNotFoundException();
    }

    await this.prisma.$transaction(async (tx) => {
      // update borrowing statud and returnedAt
      await tx.borrowing.update({
        where: { id: borrowingId },
        data: {
          status: BorrowingStatus.RETURNED,
          returnedAt: new Date(),
        },
      });

      // update book copy status
      await tx.bookCopy.update({
        where: { id: borrowing.bookCopyId },
        data: { status: BookStatus.AVAILABLE },
      });
    });

    return this.getBorrowingDetails(borrowingId);
  }
  // ----------------------------
  // -- GET CURRENT BORROWINGS --
  // ----------------------------

  async getCurrentUserBorrowings(userId: string) {
    // check if user exists and is active
    await this.usersService.getActiveAuthUserById(userId);

    return this.getCurrentBorrowings(userId);
  }

  // ----------------------------
  // -- GET BORROWINGS HISTORY --
  // ----------------------------

  async getUserBorrowingHistory(userId: string) {
    // check if user exists and is active
    await this.usersService.getActiveAuthUserById(userId);

    return this.getBorrowingHistory(userId);
  }

  // --------------------------
  // -------- HELPERS ---------
  // --------------------------

  private async getBorrowingDetails(borrowingId: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: {
        id: borrowingId,
      },
      select: borrowingSelect,
    });

    if (!borrowing) {
      throw new BorrowingNotFoundException();
    }

    return borrowing;
  }

  private async getBorrowingsDetails(borrowingIds: string[]) {
    return this.prisma.borrowing.findMany({
      where: {
        id: {
          in: borrowingIds,
        },
      },
      select: borrowingSelect,
    });
  }

  private async getActiveBorrowingById(borrowingId: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id: borrowingId },
      select: { id: true, status: true, bookCopyId: true, userId: true },
    });

    if (!borrowing) {
      throw new BorrowingNotFoundException();
    }

    if (borrowing.status !== BorrowingStatus.ACTIVE) {
      throw new BorrowingInactiveException();
    }

    return borrowing;
  }

  private async getCurrentBorrowings(userId: string) {
    return this.prisma.borrowing.findMany({
      where: {
        userId,
        status: { not: BorrowingStatus.RETURNED },
      },
      orderBy: {
        borrowedAt: 'desc',
      },
      select: borrowingSelect,
    });
  }

  private async getBorrowingHistory(userId: string) {
    return this.prisma.borrowing.findMany({
      where: {
        userId,
        status: BorrowingStatus.RETURNED,
      },
      orderBy: {
        returnedAt: 'desc',
      },
      select: borrowingSelect,
    });
  }

  async ensureUserReturnedBook(userId: string, bookId: string) {
    const returnedBorrowingId = await this.prisma.borrowing.findFirst({
      where: {
        userId,
        status: BorrowingStatus.RETURNED,
        bookCopy: { bookId },
      },
      select: { id: true },
    });

    // if user have never borrowed this book throw exception
    if (!returnedBorrowingId) {
      throw new BookNotBorrowedException();
    }

    return returnedBorrowingId;
  }
}
