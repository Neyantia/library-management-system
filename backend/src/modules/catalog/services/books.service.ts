import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

import { sanitize } from '../../../common/helpers/string.helper.js';
import { createInventoryNumber } from '../helpers/create-inventory-number.helper.js';

import { BookStatus } from '../../../prisma/prisma.types.js';
import { SanitizedCreateBookData } from '../types/sanitized-create-book-data.type.js';
import { SanitizedUpdateBookData } from '../types/sanitized-update-book.type.js';

import { CreateBookDto } from '../dto/books/create-book.dto.js';
import { UpdateCopiesCountDto } from '../dto/books/update-copies-count.dto.js';
import { ListBooksQueryDto } from '../dto/books/list-books-query.dto.js';
import { UpdateBookDto } from '../dto/books/update-book.dto.js';

import { AuthorsDoNotExistException } from '../exceptions/books/authors-do-not-exist.exception.js';
import { CategoryNotFoundException } from '../exceptions/categories/category-not-found.exception.js';
import { CategoryInactiveException } from '../exceptions/categories/category-inactive.exception.js';
import { BookAlreadyExistsException } from '../exceptions/books/book-already-exists.exception.js';
import { BookNotFoundException } from '../exceptions/books/book-not-found.exception.js';
import { ActiveCategoryForBook } from '../types/active-cateogry-for-book.type.js';
import { BookInactiveException } from '../exceptions/books/book-inactive.exception.js';
import { EmptyBookUpdateException } from '../exceptions/books/empty-book-update.exception.js';
import { CannotReduceCopiesBelowBorrowedException } from '../exceptions/books/cannot-reduce-copies-below-borrowed.exception.js';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------
  // ------ GET ALL BOOKS ------
  // ---------------------------

  async getAllBooks(query: ListBooksQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const search = query.search;
    const authorId = query.authorId;
    const categoryId = query.categoryId;

    const where: Prisma.BookWhereInput = { isActive: true };

    if (search) {
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }];
    }

    if (authorId) {
      where.authors = { some: { authorId } };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const books = await this.prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        coverImageUrl: true,
        publicationYear: true,
        authors: {
          select: {
            author: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        category: { select: { id: true, name: true } },
        copies: { select: { status: true } },
        reviews: { select: { rating: true } },
      },
    });

    const total = await this.prisma.book.count({ where });

    return {
      items: books,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------
  // ---- GET BOOK DETAILS -----
  // ---------------------------

  async getBookDetails(bookId: string) {
    return await this.getBookWithDetails(bookId);
  }

  // ---------------------------
  // ------- CREATE BOOK -------
  // ---------------------------

  async createBook(createBookDto: CreateBookDto) {
    const { authorIds, categoryId, copiesCount } = createBookDto;

    // sanitize input fields
    const sanitized = this.sanitizeCreateBookInput(createBookDto);

    // validate category
    const category = await this.validateCategory(createBookDto.categoryId);

    // validate authors
    await this.validateAuthors(createBookDto.authorIds);

    // check if book already exists
    const existingBook = await this.findBookByIsbn(sanitized.sanitizedIsbn);

    if (existingBook && existingBook.isActive) {
      throw new BookAlreadyExistsException();
    }

    if (existingBook && !existingBook.isActive) {
      const bookId = await this.reactivateBook(existingBook.id, sanitized, categoryId, authorIds);
      return this.getBookWithDetails(bookId);
    }

    const bookId = await this.createNewBook(sanitized, category, authorIds, copiesCount);
    return this.getBookWithDetails(bookId);
  }

  // ---------------------------
  // ------- UPDATE BOOK -------
  // ---------------------------

  async updateBook(bookId: string, updateBookDto: UpdateBookDto) {
    const { authorIds, categoryId } = updateBookDto;

    const sanitized = this.sanitizeUpdateBookInput(updateBookDto);

    const hasBookFieldChanges = Object.values(sanitized).some((value) => value !== undefined);
    const hasCategoryChange = categoryId !== undefined;
    const hasAuthorsChange = authorIds !== undefined;

    if (!hasBookFieldChanges && !hasCategoryChange && !hasAuthorsChange) {
      throw new EmptyBookUpdateException();
    }

    const existingBook = await this.findBookById(bookId);

    if (!existingBook) {
      throw new BookNotFoundException();
    }

    if (!existingBook.isActive) {
      throw new BookInactiveException();
    }

    const category = categoryId ? await this.validateCategory(categoryId) : undefined;

    if (authorIds !== undefined) {
      await this.validateAuthors(authorIds);
    }

    const finalBookData = this.buildFinalBookUpdateData(existingBook, sanitized, category?.id);

    return this.getBookWithDetails(await this.updateExistingBook(bookId, finalBookData, authorIds));
  }

  // ---------------------------
  // --- UPDATE COPIES COUNT ---
  // ---------------------------

  async updateCopiesCount(bookId: string, updateCopiesCountDto: UpdateCopiesCountDto) {
    const target = updateCopiesCountDto.copies;

    const updatedBookId = await this.prisma.$transaction(async (tx) => {
      const existingBook = await tx.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          isActive: true,
          category: {
            select: {
              name: true,
            },
          },
          copies: {
            select: {
              id: true,
              status: true,
              inventoryNumber: true,
            },
            orderBy: {
              inventoryNumber: 'asc',
            },
          },
        },
      });

      if (!existingBook) {
        throw new BookNotFoundException();
      }

      if (!existingBook.isActive) {
        throw new BookInactiveException();
      }

      const totalCopiesCount = existingBook.copies.length;

      const borrowedCopies = existingBook.copies.filter(
        (copy) => copy.status === BookStatus.BORROWED,
      );

      const availableCopies = existingBook.copies.filter(
        (copy) => copy.status === BookStatus.AVAILABLE,
      );

      const currentOperationalCopies = borrowedCopies.length + availableCopies.length;

      if (target === currentOperationalCopies) {
        return existingBook.id;
      }

      if (target > currentOperationalCopies) {
        const copiesToAdd = target - currentOperationalCopies;

        await tx.bookCopy.createMany({
          data: Array.from({ length: copiesToAdd }, (_, index) => ({
            bookId: existingBook.id,
            inventoryNumber: createInventoryNumber(
              existingBook.category.name,
              new Date().getFullYear(),
              existingBook.id,
              totalCopiesCount + index + 1,
            ),
            status: BookStatus.AVAILABLE,
          })),
        });

        return existingBook.id;
      }

      const copiesToRemove = currentOperationalCopies - target;

      if (copiesToRemove > availableCopies.length) {
        throw new CannotReduceCopiesBelowBorrowedException();
      }

      const removableCopyIds = availableCopies.slice(0, copiesToRemove).map((copy) => copy.id);

      await tx.bookCopy.updateMany({
        where: {
          id: {
            in: removableCopyIds,
          },
        },
        data: {
          status: BookStatus.REMOVED,
        },
      });

      return existingBook.id;
    });

    return this.getBookWithDetails(updatedBookId);
  }

  // ---------------------------
  // ------- DELETE BOOK -------
  // ---------------------------

  async deleteBook(bookId: string) {
    // soft delete book
    try {
      await this.prisma.book.update({
        where: { id: bookId },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BookNotFoundException();
      }

      throw error;
    }
  }

  // ---------------------------
  // --------- HELPERS ---------
  // ---------------------------

  // ----- SANITIZE INPUTS -----
  private sanitizeCreateBookInput(createBookDto: CreateBookDto) {
    const sanitizedTitle = sanitize(createBookDto.title);
    const sanitizedSubtitle = createBookDto.subtitle ? sanitize(createBookDto.subtitle) : undefined;
    const sanitizedDescription = createBookDto.description
      ? sanitize(createBookDto.description)
      : undefined;
    const sanitizedLanguage = sanitize(createBookDto.language);
    const sanitizedCoverImageUrl = createBookDto.coverImageUrl
      ? sanitize(createBookDto.coverImageUrl)
      : undefined;
    const sanitizedIsbn = sanitize(createBookDto.isbn).replace(/-/g, '');
    const publicationYear = createBookDto.publicationYear;

    return {
      sanitizedTitle,
      sanitizedSubtitle,
      sanitizedDescription,
      sanitizedLanguage,
      sanitizedCoverImageUrl,
      sanitizedIsbn,
      publicationYear,
    };
  }

  private sanitizeUpdateBookInput(updateBookDto: UpdateBookDto) {
    const sanitizedTitle = updateBookDto.title ? sanitize(updateBookDto.title) : undefined;
    const sanitizedSubtitle = updateBookDto.subtitle ? sanitize(updateBookDto.subtitle) : undefined;
    const sanitizedDescription = updateBookDto.description
      ? sanitize(updateBookDto.description)
      : undefined;
    const sanitizedLanguage = updateBookDto.language ? sanitize(updateBookDto.language) : undefined;
    const sanitizedCoverImageUrl = updateBookDto.coverImageUrl
      ? sanitize(updateBookDto.coverImageUrl)
      : undefined;
    const sanitizedIsbn = updateBookDto.isbn
      ? sanitize(updateBookDto.isbn).replace(/-/g, '')
      : undefined;
    const publicationYear = updateBookDto.publicationYear ?? undefined;

    return {
      sanitizedTitle,
      sanitizedSubtitle,
      sanitizedDescription,
      sanitizedLanguage,
      sanitizedCoverImageUrl,
      sanitizedIsbn,
      publicationYear,
    };
  }

  // ----- VALIDATE CATEGORY -----
  private async validateCategory(dtoCategoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: dtoCategoryId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    if (!category.isActive) {
      throw new CategoryInactiveException();
    }

    return category;
  }

  // ----- VALIDATE AUTHORS -----
  private async validateAuthors(dtoAuthorsIds: string[]) {
    const authors = await this.prisma.author.findMany({
      where: {
        id: { in: dtoAuthorsIds },
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (authors.length !== dtoAuthorsIds.length) {
      throw new AuthorsDoNotExistException();
    }

    return authors;
  }

  // ----- FIND BOOK BY ISBN -----
  private async findBookByIsbn(isbn: string) {
    return await this.prisma.book.findUnique({
      where: { isbn },
      select: { id: true, isActive: true },
    });
  }

  // ----- FIND BOOK BY ID -----
  private async findBookById(bookId: string) {
    return await this.prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        isActive: true,
        title: true,
        subtitle: true,
        description: true,
        isbn: true,
        publicationYear: true,
        language: true,
        coverImageUrl: true,
        categoryId: true,
      },
    });
  }

  // ----- FIND ACTIVE BOOK BY ID -----
  async getActiveBookById(bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!book) {
      throw new BookNotFoundException();
    }

    if (!book.isActive) {
      throw new BookInactiveException();
    }

    return book;
  }

  // ----- REACTIVATE BOOK -----
  private async reactivateBook(
    bookId: string,
    bookData: SanitizedCreateBookData,
    categoryId: string,
    authorIds: string[],
  ) {
    try {
      // transaction to create a book
      return await this.prisma.$transaction(async (tx) => {
        // create a book
        const reactivatedBook = await tx.book.update({
          where: { id: bookId },
          data: {
            title: bookData.sanitizedTitle,
            subtitle: bookData.sanitizedSubtitle,
            description: bookData.sanitizedDescription,
            isbn: bookData.sanitizedIsbn,
            publicationYear: bookData.publicationYear,
            language: bookData.sanitizedLanguage,
            coverImageUrl: bookData.sanitizedCoverImageUrl,
            categoryId,
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

        // delete old authors
        await tx.bookAuthor.deleteMany({ where: { bookId: reactivatedBook.id } });

        // create bookAuthor
        await tx.bookAuthor.createMany({
          data: authorIds.map((authorId) => ({
            bookId: reactivatedBook.id,
            authorId,
          })),
        });

        return reactivatedBook.id;
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BookNotFoundException();
      }

      throw error;
    }
  }

  // ----- CREATE NEW BOOK -----
  private async createNewBook(
    bookData: SanitizedCreateBookData,
    category: ActiveCategoryForBook,
    authorIds: string[],
    copiesCount: number,
  ) {
    try {
      // transaction to create a book
      return await this.prisma.$transaction(async (tx) => {
        // create a book
        const createdBook = await tx.book.create({
          data: {
            title: bookData.sanitizedTitle,
            subtitle: bookData.sanitizedSubtitle,
            description: bookData.sanitizedDescription,
            isbn: bookData.sanitizedIsbn,
            publicationYear: bookData.publicationYear,
            language: bookData.sanitizedLanguage,
            coverImageUrl: bookData.sanitizedCoverImageUrl,
            categoryId: category.id,
          },
          select: {
            id: true,
          },
        });

        // create bookAuthor
        await tx.bookAuthor.createMany({
          data: authorIds.map((authorId) => ({
            bookId: createdBook.id,
            authorId,
          })),
        });

        // create bookCopy
        await tx.bookCopy.createMany({
          data: Array.from({ length: copiesCount }, (_, index) => ({
            bookId: createdBook.id,
            inventoryNumber: createInventoryNumber(
              category.name,
              new Date().getFullYear(),
              createdBook.id,
              index + 1,
            ),
            status: BookStatus.AVAILABLE,
          })),
        });

        return createdBook.id;
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BookAlreadyExistsException();
      }

      throw error;
    }
  }

  // ----- BUILD UPDATE OBJECT -----
  private buildFinalBookUpdateData(
    existingBook: {
      title: string;
      subtitle: string | null;
      description: string | null;
      isbn: string;
      publicationYear: number;
      language: string;
      coverImageUrl: string | null;
      categoryId: string;
    },
    sanitized: SanitizedUpdateBookData,
    validatedCategoryId?: string,
  ) {
    return {
      title: sanitized.sanitizedTitle !== undefined ? sanitized.sanitizedTitle : existingBook.title,

      subtitle:
        sanitized.sanitizedSubtitle !== undefined
          ? sanitized.sanitizedSubtitle || null
          : existingBook.subtitle,

      description:
        sanitized.sanitizedDescription !== undefined
          ? sanitized.sanitizedDescription || null
          : existingBook.description,

      isbn: sanitized.sanitizedIsbn !== undefined ? sanitized.sanitizedIsbn : existingBook.isbn,

      publicationYear:
        sanitized.publicationYear !== undefined
          ? sanitized.publicationYear
          : existingBook.publicationYear,

      language:
        sanitized.sanitizedLanguage !== undefined
          ? sanitized.sanitizedLanguage
          : existingBook.language,

      coverImageUrl:
        sanitized.sanitizedCoverImageUrl !== undefined
          ? sanitized.sanitizedCoverImageUrl || null
          : existingBook.coverImageUrl,

      categoryId: validatedCategoryId !== undefined ? validatedCategoryId : existingBook.categoryId,
    };
  }

  // ----- UPDATE BOOK -----
  private async updateExistingBook(
    bookId: string,
    bookData: {
      title: string;
      subtitle: string | null;
      description: string | null;
      isbn: string;
      publicationYear: number;
      language: string;
      coverImageUrl: string | null;
      categoryId: string;
    },
    authorIds?: string[],
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedBook = await tx.book.update({
          where: { id: bookId },
          data: {
            title: bookData.title,
            subtitle: bookData.subtitle,
            description: bookData.description,
            isbn: bookData.isbn,
            publicationYear: bookData.publicationYear,
            language: bookData.language,
            coverImageUrl: bookData.coverImageUrl,
            categoryId: bookData.categoryId,
          },
          select: {
            id: true,
          },
        });

        if (authorIds !== undefined) {
          await tx.bookAuthor.deleteMany({
            where: { bookId: updatedBook.id },
          });

          await tx.bookAuthor.createMany({
            data: authorIds.map((authorId) => ({
              bookId: updatedBook.id,
              authorId,
            })),
          });
        }

        return updatedBook.id;
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BookAlreadyExistsException();
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new BookNotFoundException();
      }

      throw error;
    }
  }

  // ----- GET BOOK DETAILS -----
  private async getBookWithDetails(bookId: string) {
    // find book with details
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        category: { select: { id: true, name: true } },
        authors: {
          select: {
            author: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        copies: { select: { status: true }, where: { status: { not: BookStatus.REMOVED } } },
        reviews: {
          select: { id: true, rating: true, content: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // if created book does not exist throws exception
    if (!book) {
      throw new BookNotFoundException();
    }

    // return created book
    return book;
  }
}
