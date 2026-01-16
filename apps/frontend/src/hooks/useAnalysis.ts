import { useState, useCallback } from 'react';
import { apiClient, AnalysisResult } from '../services/apiClient';

interface UseAnalysisParams {
  resourceId?: string;
  metricKey?: string;
  windowSize?: number;
}

interface UseAnalysisState {
  result: AnalysisResult | null;
  loading: boolean;
  error: Error | null;
  evaluate: (params: UseAnalysisParams) => Promise<void>;
}

export function useAnalysis(): UseAnalysisState {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const evaluate = useCallback(async (params: UseAnalysisParams) => {
    if (!params.resourceId || !params.metricKey) {
      setError(new Error('resourceId and metricKey are required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.evaluate({
        resourceId: params.resourceId,
        metricKey: params.metricKey,
        windowSize: params.windowSize,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to evaluate analysis'));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    evaluate,
  };
}
