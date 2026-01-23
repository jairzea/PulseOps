/**
 * Metadata de paginación (idéntica al backend)
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Response paginada del backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Query params para endpoints paginados
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Estado de paginación para hooks/componentes
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
