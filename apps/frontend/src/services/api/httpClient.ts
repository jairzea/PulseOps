/**
 * HttpClient - Cliente HTTP base para comunicación con el backend
 * Proporciona métodos genéricos para GET, POST, PATCH, DELETE
 */
import { ErrorHandler } from '../../utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

/**
 * Cliente HTTP base con manejo de autenticación y errores
 */
export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Método privado para realizar requests HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const token = typeof localStorage !== 'undefined' 
        ? localStorage.getItem('auth_token') 
        : null;

      const headers = {
        ...this.defaultHeaders,
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as HeadersInit;

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        return await ErrorHandler.handleHttpError(response);
      }

      // Manejar respuestas sin cuerpo (204 No Content)
      const text = await response.text();
      if (!text) {
        return undefined as unknown as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch (err) {
        return ErrorHandler.handleGenericError(err);
      }
    } catch (error) {
      return ErrorHandler.handleGenericError(error);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Instancia por defecto del HttpClient
 */
export const httpClient = new HttpClient();
