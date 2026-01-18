/**
 * RecordsPage - Gestión de registros manuales
 */
import { useState, useEffect } from 'react';
import { useRecordsStore } from '../stores/recordsStore';
import { useResources } from '../hooks/useResources';
import { useMetrics } from '../hooks/useMetrics';
import { RecordModal } from '../components/RecordModal';
import { PulseLoader } from '../components/PulseLoader';
import { PageHeader } from '../components/PageHeader';

export const RecordsPage: React.FC = () => {
    const { records, loading, error, fetchRecords, setModalOpen } = useRecordsStore();
    const { resources } = useResources();
    const { metrics } = useMetrics();

    const [selectedResourceId, setSelectedResourceId] = useState<string>('');
    const [selectedMetricKey, setSelectedMetricKey] = useState<string>('');

    // Fetch records cuando cambian los filtros
    useEffect(() => {
        if (selectedResourceId && selectedMetricKey) {
            fetchRecords({
                resourceId: selectedResourceId,
                metricKey: selectedMetricKey
            });
        }
    }, [selectedResourceId, selectedMetricKey, fetchRecords]);

    const formatWeek = (week: string) => {
        return week;
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Registros"
                    description="Gestiona los registros de métricas por recurso y semana"
                    action={{
                        label: 'Agregar Registro',
                        onClick: () => setModalOpen(true),
                    }}
                />

                {/* Filtros */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selector de Recurso */}
                        <div>
                            <label htmlFor="resource" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Recurso
                            </label>
                            <select
                                id="resource"
                                value={selectedResourceId}
                                onChange={(e) => setSelectedResourceId(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar recurso...</option>
                                {resources.map((resource) => (
                                    <option key={resource.id} value={resource.id}>
                                        {resource.name} ({resource.roleType})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Métrica */}
                        <div>
                            <label htmlFor="metric" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Métrica
                            </label>
                            <select
                                id="metric"
                                value={selectedMetricKey}
                                onChange={(e) => setSelectedMetricKey(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar métrica...</option>
                                {metrics.map((metric) => (
                                    <option key={metric.id} value={metric.key}>
                                        {metric.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabla de registros */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    {!selectedResourceId || !selectedMetricKey ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">Selecciona un recurso y una métrica para ver los registros</p>
                        </div>
                    ) : loading ? (
                        <div className="p-12">
                            <PulseLoader size="lg" variant="success" text="Cargando registros..." />
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-500">Error al cargar registros: {error}</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600 dark:text-gray-400">No hay registros para esta combinación</p>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="mt-4 text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                Crear el primer registro
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Semana
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Fuente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-mono rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                                {formatWeek(record.week)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{record.value}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                                {record.source || 'MANUAL'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{formatTimestamp(record.timestamp)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button className="text-blue-500 hover:text-blue-400 mr-4">
                                                Editar
                                            </button>
                                            <button className="text-red-500 hover:text-red-400">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Estadísticas */}
                {records.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Registros</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{records.length}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Valor Promedio</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {(records.reduce((acc, r) => acc + r.value, 0) / records.length).toFixed(1)}
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Último Valor</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {records[records.length - 1]?.value || 0}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de formulario */}
            <RecordModal resources={resources} />
        </div>
    );
};
