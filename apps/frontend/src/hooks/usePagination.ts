import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PaginationState } from '../types/pagination';

/**
 * Hook reutilizable para manejar estado de paginación
 * Incluye debounce automático para búsqueda
 * 
 * @param initialPageSize - Tamaño de página inicial (default: 10)
 * @returns Estado y métodos para controlar paginación
 * 
 * @example
 * ```tsx
 * const pagination = usePagination(20);
 * 
 * // En useEffect
 * useEffect(() => {
 *   fetchData(pagination.params);
 * }, [pagination.params]);
 * 
 * // En UI
 * <SearchInput value={pagination.search} onChange={pagination.setSearch} />
 * <PaginationControls {...pagination} meta={meta} />
 * ```
 */
export function usePagination(initialPageSize: number = 10) {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    search: '',
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(state.search);
    }, 400);

    return () => clearTimeout(timer);
  }, [state.search]);

  // Resetear página cuando cambia search o pageSize
  useEffect(() => {
    if (state.page !== 1 && (debouncedSearch !== state.search || state.pageSize)) {
      setState((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearch, state.pageSize]);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const goToFirstPage = useCallback(() => {
    setState((prev) => ({ ...prev, page: 1 }));
  }, []);

  const goToLastPage = useCallback((totalPages: number) => {
    setState((prev) => ({ ...prev, page: totalPages }));
  }, []);

  // Memoizar params para evitar recreación en cada render
  const params = useMemo(() => ({
    page: state.page,
    pageSize: state.pageSize,
    search: debouncedSearch || undefined,
  }), [state.page, state.pageSize, debouncedSearch]);

  return {
    // Estado actual
    page: state.page,
    pageSize: state.pageSize,
    search: state.search,
    debouncedSearch,

    // Setters
    setPage,
    setPageSize,
    setSearch,

    // Navegación
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,

    // Params listos para enviar al backend
    params,
  };
}
