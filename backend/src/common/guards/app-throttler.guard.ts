import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(AppThrottlerGuard.name);

  protected override async getTracker(req: Record<string, any>): Promise<string> {
    const forwardedFor = req.headers?.['x-forwarded-for'];
    const firstForwardedIp =
      typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined;

    const ip = firstForwardedIp || req.ip || req.socket?.remoteAddress || 'unknown-ip';

    const userAgent = req.headers?.['user-agent'] ?? 'unknown-agent';

    return `${ip}:${userAgent}`;
  }

  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { req } = this.getRequestResponse(context);

    this.logger.warn(`Rate limit exceeded | method=${req.method} path=${req.url} ip=${req.ip}`);

    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}
