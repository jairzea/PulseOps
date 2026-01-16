import { useState, useEffect } from 'react';
import { apiClient, Resource } from '../services/apiClient';

interface UseResourcesState {
  resources: Resource[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useResources(): UseResourcesState {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getResources();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch resources'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    loading,
    error,
    refetch: fetchResources,
  };
}
