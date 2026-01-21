import { useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { AutocompleteInfinite } from './AutocompleteInfinite';

interface MetricSelectorProps {
    selectedKey: string | null;
    onSelect: (metricKey: string) => void;
    loading?: boolean;
    resourceId?: string | null;
}

export function MetricSelector({
    selectedKey,
    onSelect,
    loading = false,
    resourceId,
}: MetricSelectorProps) {
    // Memoizar fetchFunction para evitar re-renders innecesarios
    // Incluye resourceId en dependencias para que se actualice cuando cambia el recurso
    const fetchFunction = useCallback(async (page: number, search: string, pageSize: number) => {
        const response = await apiClient.getMetricsPaginated({
            page,
            pageSize,
            search: search || undefined,
            resourceId: resourceId || undefined,
        });
        return {
            data: response.data.map(m => ({
                value: m.key,
                label: m.label,
                description: m.description,
            })),
            meta: response.meta,
        };
    }, [resourceId]);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-64"></div>
            </div>
        );
    }

    return (
        <div className="min-w-[200px]">
            <AutocompleteInfinite
                value={selectedKey || ''}
                onChange={onSelect}
                fetchFunction={fetchFunction}
                placeholder="Select a metric"
                pageSize={15}
            />
        </div>
    );
}
