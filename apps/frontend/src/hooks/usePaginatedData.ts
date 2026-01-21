/**
 * usePaginatedData - Hook genérico para manejo de datos paginados
 * Elimina duplicación de código en páginas con paginación
 */
import { useState, useEffect, useCallback } from 'react';
import { usePagination } from './usePagination';
import type { PaginatedResponse, PaginationParams, PaginationMeta } from '../types/pagination';

interface UsePaginatedDataOptions<T> {
  /**
   * Función que obtiene datos paginados
   */
  fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  
  /**
   * Tamaño de página inicial (default: 10)
   */
  initialPageSize?: number;
  
  /**
   * Dependencias adicionales para recargar datos
   */
  dependencies?: any[];

  /**
   * Callback ejecutado después de cargar datos exitosamente
   */
  onSuccess?: (data: T[], meta: PaginationMeta) => void;

  /**
   * Callback ejecutado cuando ocurre un error
   */
  onError?: (error: Error) => void;
}

interface UsePaginatedDataReturn<T> {
  /** Datos actuales */
  data: T[];
  
  /** Metadatos de paginación */
  meta: PaginationMeta;
  
  /** Estado de carga */
  loading: boolean;
  
  /** Error si existe */
  error: string | null;
  
  /** Función para recargar datos */
  reload: () => Promise<void>;
  
  /** Función para actualizar datos manualmente */
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  
  /** Objeto de paginación con métodos y estados */
  pagination: ReturnType<typeof usePagination>;
}

/**
 * Hook genérico para manejo de datos paginados con loading/error/data
 * 
 * @example
 * ```tsx
 * const { data: metrics, loading, error, reload, pagination } = usePaginatedData({
 *   fetchFn: metricsApi.getPaginated,
 *   initialPageSize: 10,
 * });
 * ```
 */
export function usePaginatedData<T>({
  fetchFn,
  initialPageSize = 10,
  dependencies = [],
  onSuccess,
  onError,
}: UsePaginatedDataOptions<T>): UsePaginatedDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  const pagination = usePagination(initialPageSize);

  /**
   * Función para cargar datos
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFn(pagination.params);
      setData(response.data);
      setMeta(response.meta);
      
      if (onSuccess) {
        onSuccess(response.data, response.meta);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      console.error('Error al cargar datos paginados:', err);
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pagination.params, onSuccess, onError]);

  /**
   * Cargar datos cuando cambien los parámetros de paginación o dependencias
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    meta,
    loading,
    error,
    reload: loadData,
    setData,
    pagination,
  };
}
