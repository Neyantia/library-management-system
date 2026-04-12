import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { MiddlewareConsumer, Module, ValidationPipe, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import configuration from './config/configuration.js';
import { envValidationSchema } from './config/env.schema.js';

import { AppThrottlerGuard } from './common/guards/app-throttler.guard.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { BorrowingsModule } from './modules/borrowings/borrowings.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development',
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 30,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CatalogModule,
    BorrowingsModule,
    ReviewsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(), helmet()).forRoutes('*');
  }
}
