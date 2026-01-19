import { Metric } from '../services/apiClient';
import { Autocomplete } from './Autocomplete';

interface MetricSelectorProps {
    metrics: Metric[];
    selectedKey: string | null;
    onSelect: (metricKey: string) => void;
    loading?: boolean;
}

export function MetricSelector({
    metrics,
    selectedKey,
    onSelect,
    loading = false,
}: MetricSelectorProps) {
    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-64"></div>
            </div>
        );
    }

    return (
        <div className="min-w-[200px]">
            <Autocomplete
                options={metrics.map(metric => ({
                    value: metric.key,
                    label: metric.label,
                    description: metric.description
                }))}
                value={selectedKey || ''}
                onChange={onSelect}
                placeholder={metrics.length === 0 ? 'No metrics available' : 'Select a metric'}
                disabled={metrics.length === 0}
            />
        </div>
    );
}
