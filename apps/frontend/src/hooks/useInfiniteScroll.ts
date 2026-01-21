import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchFunction: (page: number, search: string, pageSize: number) => Promise<{ data: T[]; meta: { totalPages: number } }>;
  pageSize?: number;
  searchDebounce?: number;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  search: string;
  setSearch: (search: string) => void;
  loadMore: () => void;
  reset: () => void;
}

export function useInfiniteScroll<T>({
  fetchFunction,
  pageSize = 20,
  searchDebounce = 400,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, searchDebounce);

    return () => clearTimeout(timer);
  }, [search, searchDebounce]);

  // Reset cuando cambia la búsqueda
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [debouncedSearch]);

  // Fetch data
  const fetchData = useCallback(async (pageToFetch: number, searchTerm: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction(pageToFetch, searchTerm, pageSize);

      setItems((prev) => {
        // Si es la primera página, reemplazar
        if (pageToFetch === 1) {
          return response.data;
        }
        // Si es página siguiente, agregar
        return [...prev, ...response.data];
      });

      setHasMore(pageToFetch < response.meta.totalPages);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pageSize]);

  // Cargar datos cuando cambian page o debouncedSearch
  useEffect(() => {
    fetchData(page, debouncedSearch);
  }, [page, debouncedSearch, fetchData]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setSearch('');
    setError(null);
  }, [setSearch]);

  return {
    items,
    loading,
    error,
    hasMore,
    search,
    setSearch,
    loadMore,
    reset,
  };
}
