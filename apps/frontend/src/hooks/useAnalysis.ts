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
  reset: () => void;
}

export function useAnalysis(): UseAnalysisState {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const evaluate = useCallback(async (params: UseAnalysisParams) => {
    if (!params.resourceId || !params.metricKey) {
      setError(new Error('resourceId and metricKey are required'));
      setResult(null); // Limpiar resultado cuando faltan parámetros
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
      // Si es un NotFoundError (no hay registros), no lo tratamos como error crítico
      const error = err instanceof Error ? err : new Error('Failed to evaluate analysis');
      const isNotFoundError = error.message?.includes('No records found');
      
      if (!isNotFoundError) {
        console.warn('[useAnalysis] Error evaluating:', error.message);
      }
      
      setError(error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    result,
    loading,
    error,
    evaluate,
    reset,
  };
}
