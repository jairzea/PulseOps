import { Resource } from '../services/apiClient';

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
        <div className="relative">
            <select
                value={selectedId || ''}
                onChange={(e) => onSelect(e.target.value)}
                className="appearance-none bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-750 min-w-[200px]"
                disabled={resources.length === 0}
            >
                <option value="" disabled>
                    {resources.length === 0 ? 'No resources available' : 'Select a resource'}
                </option>
                {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                        {resource.name} ({resource.roleType})
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </div>
        </div>
    );
}
