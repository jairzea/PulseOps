/**
 * Filtro global de excepciones - Principio de Responsabilidad Única
 * Responsabilidad: Interceptar todas las excepciones y formatear la respuesta
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app.exception';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log del error (solo errores 5xx)
    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${errorResponse.message}`,
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Construye la respuesta de error según el tipo de excepción
   * Principio Abierto/Cerrado: Abierto a extensión (nuevos tipos de error), cerrado a modificación
   */
  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // AppException (nuestras excepciones personalizadas)
    if (exception instanceof AppException) {
      const response = exception.getResponse() as any;
      return {
        statusCode: exception.getStatus(),
        message: response.message,
        errorCode: response.errorCode,
        details: response.details,
        timestamp: response.timestamp,
        path,
      };
    }

    // HttpException de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as any).message || 'Error';

      return {
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        errorCode: this.getErrorCodeFromStatus(status),
        timestamp,
        path,
      };
    }

    // Error genérico
    const message =
      exception instanceof Error
        ? exception.message
        : 'Error interno del servidor';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorCode: 'INTERNAL_SERVER_ERROR',
      timestamp,
      path,
    };
  }

  /**
   * Mapea códigos HTTP a códigos de error
   */
  private getErrorCodeFromStatus(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
