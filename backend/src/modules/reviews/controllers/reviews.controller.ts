import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { JwtAuthUser } from '../../auth/types/jwt-auth-user.type.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

import { ReviewsService } from '../services/reviews.service.js';

import { ErrorResponseDto } from '../../../common/dto/error-response.dto.js';
import { CreateReviewDto } from '../dto/create-review.dto.js';
import { CreatedReviewResponseDto } from '../dto/created-review-response.dto.js';

@Controller('books/:id/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // ---------------------------
  // -------- / (POST) ---------
  // ---------------------------

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add review',
    description: 'Adds a review for a book by the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: '30bc0540-64c0-4b2e-9322-2990e14e4b4f',
  })
  @ApiCreatedResponse({
    description: 'Review created successfully',
    type: CreatedReviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body or invalid book ID format',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User or book not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Review already exists or user has not returned this book',
    type: ErrorResponseDto,
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async addReview(
    @CurrentUser() user: JwtAuthUser,
    @Param('id', new ParseUUIDPipe()) bookId: string,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<CreatedReviewResponseDto> {
    const result = await this.reviewsService.addReview(user.userId, bookId, createReviewDto);

    return {
      id: result.id,
      rating: result.rating,
      content: result.content ?? undefined,
      bookId: result.bookId,
      createdAt: result.createdAt,
    };
  }
}
