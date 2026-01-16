import { useState, useEffect } from 'react';
import { apiClient, ConditionMetadata } from '../services/apiClient';

interface UseConditionsMetadataReturn {
  conditions: ConditionMetadata[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener y cachear metadata de condiciones Hubbard.
 * Retorna las condiciones ordenadas según jerarquía oficial.
 */
export function useConditionsMetadata(): UseConditionsMetadataReturn {
  const [conditions, setConditions] = useState<ConditionMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getConditionsMetadata();
      
      // Ordenar por order (jerarquía Hubbard)
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setConditions(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar condiciones');
      console.error('Error fetching conditions metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  return {
    conditions,
    loading,
    error,
    refetch: fetchConditions,
  };
}
