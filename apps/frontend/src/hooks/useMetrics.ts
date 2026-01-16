import { useState, useEffect } from 'react';
import { apiClient, Metric } from '../services/apiClient';

interface UseMetricsState {
  metrics: Metric[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMetrics(): UseMetricsState {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
