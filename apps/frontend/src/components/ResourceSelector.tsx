import { Resource } from '../services/apiClient';
import { Autocomplete } from './Autocomplete';

interface ResourceSelectorProps {
    resources: Resource[];
    selectedId: string | null;
    onSelect: (resourceId: string) => void;
    loading?: boolean;
}

export function ResourceSelector({
    resources,
    selectedId,
    onSelect,
    loading = false,
}: ResourceSelectorProps) {
    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded-lg w-64"></div>
            </div>
        );
    }

    return (
        <div className="min-w-[200px]">
            <Autocomplete
                options={resources.map(resource => ({
                    value: resource.id,
                    label: resource.name,
                    description: resource.roleType
                }))}
                value={selectedId || ''}
                onChange={onSelect}
                placeholder={resources.length === 0 ? 'No resources available' : 'Select a resource'}
                disabled={resources.length === 0}
            />
        </div>
    );
}
