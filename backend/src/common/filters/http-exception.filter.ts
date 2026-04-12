import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';

type ExceptionResponseBody =
  | string
  | {
      statusCode?: number;
      message?: string | string[];
      error?: string;
      code?: string;
    };

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as ExceptionResponseBody;

    let message = 'Unexpected error';
    let details: string[] | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (Array.isArray(exceptionResponse?.message)) {
      message = 'Validation failed';
      details = exceptionResponse.message;
    } else if (typeof exceptionResponse?.message === 'string') {
      message = exceptionResponse.message;
    }

    response.status(status).json({
      statusCode: status,
      code: exceptionResponse['code'] ?? message.toUpperCase(),
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
