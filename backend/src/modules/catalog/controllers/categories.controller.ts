import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Roles } from '../../auth/roles/roles.decorator.js';
import { Role } from '../../../prisma/prisma.types.js';
import { RolesGuard } from '../../auth/roles/roles.guard.js';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';

import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/categories/create-category.dto.js';
import { CreatedCategoryResponseDto } from '../dto/categories/created-category-response.dto.js';
import { ListCategoriesResponseDto } from '../dto/categories/list-categories-response.dto.js';
import { UpdatedCategoryResponseDto } from '../dto/categories/updated-category-response.dto.js';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // ################################
  // ########## CATEGORY ############
  // ################################

  // ---------------------------
  // --------- / (GET) ---------
  // ---------------------------

  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns a list of all active categories.',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    type: ListCategoriesResponseDto,
  })
  @Get()
  async getAllCategories(): Promise<ListCategoriesResponseDto> {
    const result = await this.categoriesService.getAllCategories();

    return {
      items: result.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description ?? undefined,
      })),
    };
  }

  // ---------------------------
  // --------- / (POST) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create category',
    description:
      'Creates a new category or reactivates an existing inactive category. Accessible only to administrators.',
  })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CreatedCategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Category already exists',
    type: ErrorResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createCategory(@Body() category: CreateCategoryDto): Promise<CreatedCategoryResponseDto> {
    const createdCategory = await this.categoriesService.createCategory(category);

    return {
      id: createdCategory.id,
      name: createdCategory.name,
      description: createdCategory.description ?? undefined,
    };
  }

  // ---------------------------
  // -------- / (PATCH) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an active category. Accessible only to administrators.',
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: UpdatedCategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or empty update payload',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Category already exists',
    type: ErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateCategory(
    @Param('id', new ParseUUIDPipe()) categoryId: string,
    @Body() category: UpdateCategoryDto,
  ): Promise<UpdatedCategoryResponseDto> {
    const updatedCategory = await this.categoriesService.updateCategory(categoryId, category);

    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description ?? undefined,
    };
  }

  // ---------------------------
  // ------- / (DELETE) --------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete category',
    description: 'Deactivates a category. Accessible only to administrators.',
  })
  @ApiNoContentResponse({
    description: 'Category deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    type: ErrorResponseDto,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteCategory(@Param('id', new ParseUUIDPipe()) categoryId: string): Promise<void> {
    await this.categoriesService.deleteCategory(categoryId);
  }
}
