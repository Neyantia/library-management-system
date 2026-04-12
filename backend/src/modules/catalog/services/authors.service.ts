import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { sanitize, normalize } from '../../../common/helpers/string.helper.js';

import { CreateAuthorDto } from '../dto/authors/create-author.dto.js';

import { AuthorAlreadyExistsException } from '../exceptions/authors/author-already-exists.exception.js';
import { UpdateAuthorDto } from '../dto/authors/update-author.dto.js';
import { EmptyAuthorUpdateException } from '../exceptions/authors/empty-author-update.exception.js';
import { AuthorNotFoundException } from '../exceptions/authors/author-not-found.exception.js';
import { AuthorInactiveException } from '../exceptions/authors/author-inactive.exception.js';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------
  // ---- GET ALL AUTHORS ------
  // ---------------------------

  async getAllAuthors() {
    return this.prisma.author.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: { id: true, firstName: true, lastName: true },
    });
  }

  // ---------------------------
  // ------ CREATE AUTHOR ------
  // ---------------------------

  async createAuthor(createAuthorDto: CreateAuthorDto) {
    // sanitize inputs
    const firstName = sanitize(createAuthorDto.firstName);
    const lastName = sanitize(createAuthorDto.lastName);

    // normalize inputs
    const normalizedFirstName = normalize(firstName);
    const normalizedLastName = normalize(lastName);

    // check if author exists
    const existingAuthor = await this.prisma.author.findFirst({
      where: {
        normalizedFirstName,
        normalizedLastName,
      },
      select: { id: true, isActive: true },
    });

    // if author exists and is active throws exception
    if (existingAuthor && existingAuthor.isActive) {
      throw new AuthorAlreadyExistsException();
    }

    // reactivate archived author instead of creating a duplicate
    if (existingAuthor && !existingAuthor.isActive) {
      try {
        return await this.prisma.author.update({
          where: { id: existingAuthor.id },
          data: {
            firstName,
            lastName,
            normalizedFirstName,
            normalizedLastName,
            isActive: true,
            deletedAt: null,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new AuthorNotFoundException();
        }
        throw error;
      }
    }

    // if author does not exist create author
    try {
      return await this.prisma.author.create({
        data: {
          firstName,
          lastName,
          normalizedFirstName,
          normalizedLastName,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AuthorAlreadyExistsException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ------ UPDATE AUTHOR ------
  // ---------------------------

  async updateAuthor(authorId: string, updateAuthorDto: UpdateAuthorDto) {
    let newFirstName = updateAuthorDto.firstName;
    let newLastName = updateAuthorDto.lastName;

    // if fields are not defined throws exception
    if (newFirstName === undefined && newLastName === undefined) {
      throw new EmptyAuthorUpdateException();
    }

    // check if author exists
    const existingAuthor = await this.prisma.author.findUnique({
      where: { id: authorId },
      select: { id: true, firstName: true, lastName: true, isActive: true },
    });

    // if author does not exist throws exception
    if (!existingAuthor) {
      throw new AuthorNotFoundException();
    }

    // if author is inactive throws exception
    if (!existingAuthor.isActive) {
      throw new AuthorInactiveException();
    }

    // set values to update
    newFirstName = newFirstName !== undefined ? sanitize(newFirstName) : existingAuthor.firstName;

    newLastName = newLastName !== undefined ? sanitize(newLastName) : existingAuthor.lastName;

    // if inputs are empty throws exception
    if (newFirstName === '' || newLastName === '') {
      throw new EmptyAuthorUpdateException();
    }

    // normalize new values
    const normalizedFirstName = normalize(newFirstName);
    const normalizedLastName = normalize(newLastName);

    // update author
    try {
      return await this.prisma.author.update({
        where: { id: authorId },
        data: {
          firstName: newFirstName,
          lastName: newLastName,
          normalizedFirstName,
          normalizedLastName,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AuthorAlreadyExistsException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ------ DELETE AUTHOR ------
  // ---------------------------

  async deleteAuthor(authorId: string) {
    // soft delete author
    try {
      await this.prisma.author.update({
        where: { id: authorId },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AuthorNotFoundException();
      }

      throw error;
    }

    return;
  }
}
