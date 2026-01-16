import { useState, useEffect, useCallback } from 'react';
import { apiClient, Metric } from '../services/apiClient';

interface UseMetricsParams {
  resourceId?: string | null;
}

interface UseMetricsState {
  metrics: Metric[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMetrics(params: UseMetricsParams = {}): UseMetricsState {
  const { resourceId } = params;

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMetrics(resourceId || undefined);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
