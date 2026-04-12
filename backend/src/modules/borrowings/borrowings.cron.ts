import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BorrowingStatus } from '../../prisma/prisma.types.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class BorrowingsCron {
  private readonly logger = new Logger(BorrowingsCron.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async setOverdueBorrowings() {
    const now = new Date();

    const result = await this.prisma.borrowing.updateMany({
      where: {
        status: BorrowingStatus.ACTIVE,
        dueDate: {
          lt: now,
        },
      },
      data: { status: BorrowingStatus.OVERDUE },
    });

    if (result.count > 0) {
      this.logger.log(`Set ${result.count} borrowings as OVERDUE`);
    }
  }
}
