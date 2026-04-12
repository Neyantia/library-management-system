import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import { normalize, sanitize } from '../../../common/helpers/string.helper.js';

import { CreateCategoryDto } from '../dto/categories/create-category.dto.js';
import { CategoryAlreadyExistsException } from '../exceptions/categories/category-already-exists.exception.js';
import { CategoryNotFoundException } from '../exceptions/categories/category-not-found.exception.js';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto.js';
import { EmptyCategoryUpdateException } from '../exceptions/categories/empty-category-update.exception.js';
import { CategoryInactiveException } from '../exceptions/categories/category-inactive.exception.js';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------
  // --- GET ALL CATEGORIES ----
  // ---------------------------

  async getAllCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    // sanitize inputs
    const name = sanitize(createCategoryDto.name);

    const description = createCategoryDto.description
      ? sanitize(createCategoryDto.description)
      : undefined;

    // normalize input
    const normalizedName = normalize(name);

    // check if category exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { normalizedName },
      select: { id: true, isActive: true },
    });

    // if category exists and is active throws exception
    if (existingCategory && existingCategory.isActive) {
      throw new CategoryAlreadyExistsException();
    }

    // reactivate archived category instead of creating a duplicate
    if (existingCategory && !existingCategory.isActive) {
      try {
        return await this.prisma.category.update({
          where: { id: existingCategory.id },
          data: {
            name,
            description,
            normalizedName,
            isActive: true,
            deletedAt: null,
          },
          select: { id: true, name: true, description: true },
        });
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new CategoryNotFoundException();
        }
        throw error;
      }
    }

    // if category does not exist create category
    try {
      return await this.prisma.category.create({
        data: {
          name,
          description,
          normalizedName,
        },
        select: { id: true, name: true, description: true },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new CategoryAlreadyExistsException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ----- UPDATE CATEGORY -----
  // ---------------------------

  async updateCategory(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    let newName = updateCategoryDto.name;
    let newDescription = updateCategoryDto.description;

    // if fields are not defined throws exception
    if (newName === undefined && newDescription === undefined) {
      throw new EmptyCategoryUpdateException();
    }

    // check if category exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, description: true, isActive: true },
    });

    // if category does not exist throws exception
    if (!existingCategory) {
      throw new CategoryNotFoundException();
    }

    // if category is inactive throws exception
    if (!existingCategory.isActive) {
      throw new CategoryInactiveException();
    }

    // set values to update
    newName = newName !== undefined ? sanitize(newName) : existingCategory.name;

    newDescription =
      newDescription !== undefined
        ? sanitize(newDescription)
        : (existingCategory.description ?? undefined);

    // if inputs are empty throws exception
    if (newName === '') {
      throw new EmptyCategoryUpdateException();
    }

    // normalize new values
    const normalizedName = normalize(newName);

    // update category
    try {
      return await this.prisma.category.update({
        where: { id: categoryId },
        data: {
          name: newName,
          description: newDescription,
          normalizedName,
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new CategoryAlreadyExistsException();
      }

      throw error;
    }
  }

  // ---------------------------
  // ----- DELETE CATEGORY -----
  // ---------------------------

  async deleteCategory(categoryId: string) {
    // soft delete category
    try {
      await this.prisma.category.update({
        where: { id: categoryId },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new CategoryNotFoundException();
      }

      throw error;
    }

    return;
  }
}
