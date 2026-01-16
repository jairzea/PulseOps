import { useState, useEffect } from 'react';
import { apiClient, Record } from '../services/apiClient';

interface UseRecordsParams {
  resourceId?: string;
  metricKey?: string;
  enabled?: boolean;
}

interface UseRecordsState {
  records: Record[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRecords(params: UseRecordsParams = {}): UseRecordsState {
  const { resourceId, metricKey, enabled = true } = params;
  
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecords = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getRecords({ resourceId, metricKey });
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch records'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [resourceId, metricKey, enabled]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
  };
}
