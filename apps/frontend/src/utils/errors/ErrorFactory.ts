/**
 * Factory de errores - Patrón Factory + Principio Abierto/Cerrado
 * Abierto a extensión (nuevos tipos de error), cerrado a modificación
 */
import {
  AppError,
  BackendErrorResponse,
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessError,
  NetworkError,
  ServerError,
  UnauthorizedError,
  ForbiddenError,
  UnknownError,
} from './AppError';

/**
 * Tipo de función para crear errores personalizados
 */
type ErrorCreator = (response: BackendErrorResponse) => AppError;

/**
 * Factory de errores - Responsabilidad única: crear instancias de AppError
 */
export class ErrorFactory {
  /**
   * Registro de creadores de errores - Permite extensión sin modificación
   */
  private static readonly errorCreators: Map<string, ErrorCreator> = new Map([
    [
      'VALIDATION_ERROR',
      (response) => new ValidationError(response.message, response.details),
    ],
    [
      'RESOURCE_NOT_FOUND',
      (response) => new NotFoundError(response.message, response.details),
    ],
    [
      'DUPLICATE_RESOURCE',
      (response) => new ConflictError(response.message, response.details),
    ],
    [
      'BUSINESS_LOGIC_ERROR',
      (response) => new BusinessError(response.message, response.details),
    ],
    [
      'DATABASE_ERROR',
      (response) => new ServerError(response.message, response.details),
    ],
    [
      'UNAUTHORIZED',
      (response) => new UnauthorizedError(response.message),
    ],
    [
      'FORBIDDEN',
      (response) => new ForbiddenError(response.message),
    ],
    [
      'INTERNAL_SERVER_ERROR',
      (response) => new ServerError(response.message, response.details),
    ],
  ]);

  /**
   * Crea un AppError desde una respuesta del backend
   */
  static fromBackendResponse(response: BackendErrorResponse): AppError {
    const creator = this.errorCreators.get(response.errorCode);
    
    if (creator) {
      return creator(response);
    }

    // Fallback basado en statusCode
    return this.fromStatusCode(response.statusCode, response.message, response.details);
  }

  /**
   * Crea un AppError desde un código de estado HTTP
   */
  static fromStatusCode(statusCode: number, message: string, details?: unknown): AppError {
    switch (statusCode) {
      case 400:
        return new ValidationError(message, details);
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message, details);
      case 409:
        return new ConflictError(message, details);
      case 422:
        return new BusinessError(message, details);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, details);
      default:
        return new UnknownError(message, details);
    }
  }

  /**
   * Crea un AppError desde una excepción de fetch/axios
   */
  static fromFetchError(error: unknown): AppError {
    // Error de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('No se pudo conectar con el servidor');
    }

    // Error genérico
    if (error instanceof Error) {
      return new UnknownError(error.message, { originalError: error });
    }

    return new UnknownError('Error desconocido', { originalError: error });
  }

  /**
   * Registra un nuevo creador de error - Permite extensión
   */
  static registerErrorCreator(errorCode: string, creator: ErrorCreator): void {
    this.errorCreators.set(errorCode, creator);
  }
}
