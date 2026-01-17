/**
 * Sistema de errores del frontend - Principio de Responsabilidad Única
 * Cada clase de error tiene una única razón para existir
 */

/**
 * Interfaz para respuestas de error del backend
 */
export interface BackendErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

/**
 * Clase base para errores de la aplicación
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Método para obtener un mensaje user-friendly
   */
  abstract getUserMessage(): string;

  /**
   * Método para determinar si el error es recuperable
   */
  abstract isRecoverable(): boolean;
}

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }

  getUserMessage(): string {
    return this.message || 'Los datos ingresados no son válidos';
  }

  isRecoverable(): boolean {
    return true;
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'RESOURCE_NOT_FOUND', 404, details);
  }

  getUserMessage(): string {
    return this.message || 'El recurso solicitado no fue encontrado';
  }

  isRecoverable(): boolean {
    return false;
  }
}

/**
 * Error de recurso duplicado (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DUPLICATE_RESOURCE', 409, details);
  }

  getUserMessage(): string {
    return this.message || 'El recurso ya existe';
  }

  isRecoverable(): boolean {
    return true;
  }
}

/**
 * Error de lógica de negocio (422)
 */
export class BusinessError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'BUSINESS_LOGIC_ERROR', 422, details);
  }

  getUserMessage(): string {
    return this.message || 'La operación no puede completarse';
  }

  isRecoverable(): boolean {
    return true;
  }
}

/**
 * Error de red/conexión
 */
export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details);
  }

  getUserMessage(): string {
    return 'Error de conexión. Por favor, verifica tu conexión a internet.';
  }

  isRecoverable(): boolean {
    return true;
  }
}

/**
 * Error de servidor (500)
 */
export class ServerError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
  }

  getUserMessage(): string {
    return 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
  }

  isRecoverable(): boolean {
    return true;
  }
}

/**
 * Error de autorización (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 'UNAUTHORIZED', 401);
  }

  getUserMessage(): string {
    return 'No tienes autorización para realizar esta acción';
  }

  isRecoverable(): boolean {
    return false;
  }
}

/**
 * Error de permisos (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 'FORBIDDEN', 403);
  }

  getUserMessage(): string {
    return 'No tienes permisos para acceder a este recurso';
  }

  isRecoverable(): boolean {
    return false;
  }
}

/**
 * Error desconocido
 */
export class UnknownError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'UNKNOWN_ERROR', 0, details);
  }

  getUserMessage(): string {
    return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
  }

  isRecoverable(): boolean {
    return true;
  }
}
