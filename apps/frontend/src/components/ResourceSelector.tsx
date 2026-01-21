import { useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { AutocompleteInfinite } from './AutocompleteInfinite';

interface ResourceSelectorProps {
    selectedId: string | null;
    onSelect: (resourceId: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

export function ResourceSelector({
    selectedId,
    onSelect,
    loading = false,
    disabled = false,
}: ResourceSelectorProps) {
    // Memoizar fetchFunction para evitar re-renders innecesarios
    const fetchFunction = useCallback(async (page: number, search: string, pageSize: number) => {
        const response = await apiClient.getResourcesPaginated({
            page,
            pageSize,
            search: search || undefined,
        });
        return {
            data: response.data.map(r => ({
                value: r.id,
                label: r.name,
                description: r.roleType,
            })),
            meta: response.meta,
        };
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded-lg w-64"></div>
            </div>
        );
    }

    return (
        <div className="min-w-[200px]">
            <AutocompleteInfinite
                value={selectedId || ''}
                onChange={onSelect}
                fetchFunction={fetchFunction}
                placeholder="Select a resource"
                disabled={disabled}
                pageSize={15}
            />
        </div>
    );
}
