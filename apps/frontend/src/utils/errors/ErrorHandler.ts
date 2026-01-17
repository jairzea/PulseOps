/**
 * Handler centralizado de errores - Principio de Responsabilidad Única
 * Responsabilidad: Procesar errores y ejecutar acciones apropiadas
 */
import { AppError, BackendErrorResponse } from './AppError';
import { ErrorFactory } from './ErrorFactory';

/**
 * Interfaz para callbacks de manejo de errores
 */
export interface ErrorHandlerCallbacks {
  onValidationError?: (error: AppError) => void;
  onNotFoundError?: (error: AppError) => void;
  onUnauthorizedError?: (error: AppError) => void;
  onServerError?: (error: AppError) => void;
  onNetworkError?: (error: AppError) => void;
  onUnknownError?: (error: AppError) => void;
  onAnyError?: (error: AppError) => void;
}

/**
 * Handler centralizado de errores
 */
export class ErrorHandler {
  private static defaultCallbacks: ErrorHandlerCallbacks = {
    onAnyError: (error) => {
      console.error('[ErrorHandler]', error.getUserMessage(), error);
    },
  };

  /**
   * Configura callbacks por defecto para toda la aplicación
   */
  static setDefaultCallbacks(callbacks: ErrorHandlerCallbacks): void {
    this.defaultCallbacks = { ...this.defaultCallbacks, ...callbacks };
  }

  /**
   * Procesa un error de respuesta HTTP
   */
  static async handleHttpError(
    response: Response,
    customCallbacks?: ErrorHandlerCallbacks,
  ): Promise<never> {
    let errorResponse: BackendErrorResponse;

    try {
      errorResponse = await response.json();
    } catch {
      // Si no se puede parsear, crear respuesta genérica
      errorResponse = {
        statusCode: response.status,
        message: response.statusText || 'Error',
        errorCode: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        path: response.url,
      };
    }

    const appError = ErrorFactory.fromBackendResponse(errorResponse);
    this.executeCallbacks(appError, customCallbacks);
    throw appError;
  }

  /**
   * Procesa un error genérico (de fetch, network, etc)
   */
  static handleGenericError(
    error: unknown,
    customCallbacks?: ErrorHandlerCallbacks,
  ): never {
    const appError = error instanceof AppError
      ? error
      : ErrorFactory.fromFetchError(error);

    this.executeCallbacks(appError, customCallbacks);
    throw appError;
  }

  /**
   * Ejecuta callbacks según el tipo de error
   */
  private static executeCallbacks(
    error: AppError,
    customCallbacks?: ErrorHandlerCallbacks,
  ): void {
    const callbacks = { ...this.defaultCallbacks, ...customCallbacks };

    // Callback específico según código de error
    switch (error.code) {
      case 'VALIDATION_ERROR':
        callbacks.onValidationError?.(error);
        break;
      case 'RESOURCE_NOT_FOUND':
        callbacks.onNotFoundError?.(error);
        break;
      case 'UNAUTHORIZED':
        callbacks.onUnauthorizedError?.(error);
        break;
      case 'INTERNAL_SERVER_ERROR':
      case 'DATABASE_ERROR':
        callbacks.onServerError?.(error);
        break;
      case 'NETWORK_ERROR':
        callbacks.onNetworkError?.(error);
        break;
      default:
        callbacks.onUnknownError?.(error);
    }

    // Callback genérico
    callbacks.onAnyError?.(error);
  }

  /**
   * Wrapper para try-catch con manejo automático
   */
  static async tryCatch<T>(
    fn: () => Promise<T>,
    customCallbacks?: ErrorHandlerCallbacks,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      return this.handleGenericError(error, customCallbacks);
    }
  }
}
