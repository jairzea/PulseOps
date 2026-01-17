/**
 * Sistema centralizado de excepciones - Principio de Responsabilidad Única
 * Cada excepción tiene una única razón para existir: representar un tipo de error específico
 */
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base para todas las excepciones de la aplicación
 */
export abstract class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorCode: string,
    public readonly details?: unknown,
  ) {
    super(
      {
        statusCode,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

/**
 * Excepción para errores de validación
 */
export class ValidationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}

/**
 * Excepción para recursos no encontrados
 */
export class ResourceNotFoundException extends AppException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} con identificador '${identifier}' no encontrado`
      : `${resource} no encontrado`;
    super(message, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND', {
      resource,
      identifier,
    });
  }
}

/**
 * Excepción para recursos duplicados
 */
export class DuplicateResourceException extends AppException {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} con ${field} '${value}' ya existe`,
      HttpStatus.CONFLICT,
      'DUPLICATE_RESOURCE',
      { resource, field, value },
    );
  }
}

/**
 * Excepción para errores de lógica de negocio
 */
export class BusinessLogicException extends AppException {
  constructor(message: string, details?: unknown) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'BUSINESS_LOGIC_ERROR',
      details,
    );
  }
}

/**
 * Excepción para errores de base de datos
 */
export class DatabaseException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR', details);
  }
}

/**
 * Excepción para errores de autorización
 */
export class UnauthorizedException extends AppException {
  constructor(message = 'No autorizado') {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

/**
 * Excepción para errores de permisos
 */
export class ForbiddenException extends AppException {
  constructor(message = 'Acceso prohibido') {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }
}
