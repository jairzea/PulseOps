/**
 * MetricsPage - Gestión de métricas
 */
import { useEffect } from 'react';
import { useMetricsStore } from '../stores/metricsStore';
import { useResources } from '../hooks/useResources';
import { MetricModal } from '../components/MetricModal';

export const MetricsPage: React.FC = () => {
    const { metrics, loading, error, setModalOpen, setEditingMetric, fetchMetrics, deleteMetric } = useMetricsStore();
    const { resources } = useResources();

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const handleEdit = (metric: any) => {
        setEditingMetric(metric);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta métrica?')) {
            await deleteMetric(id);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header de la página */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Métricas</h1>
                        <p className="text-gray-400 mt-1">
                            Gestiona las métricas del sistema (Story Points, Performance, Integraciones, etc.)
                        </p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M12 4v16m8-8H4"></path>
                        </svg>
                        Crear Métrica
                    </button>
                </div>

                {/* Tabla de métricas */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    {loading && (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-400">Cargando métricas...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-8 text-center">
                            <p className="text-red-500">Error al cargar métricas: {error}</p>
                        </div>
                    )}

                    {!loading && !error && metrics.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-400">No hay métricas registradas</p>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="mt-4 text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                Crear la primera métrica
                            </button>
                        </div>
                    )}

                    {!loading && !error && metrics.length > 0 && (
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Etiqueta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Clave
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Unidad
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {metrics.map((metric) => (
                                    <tr key={metric.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{metric.label}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-mono rounded bg-purple-900/50 text-purple-300">
                                                {metric.key}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-400 max-w-xs truncate">
                                                {metric.description || 'Sin descripción'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400">{metric.unit || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button 
                                                onClick={() => handleEdit(metric)}
                                                className="text-blue-500 hover:text-blue-400 mr-4"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(metric.id)}
                                                className="text-red-500 hover:text-red-400"
                                            >
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
                {!loading && !error && metrics.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-400 text-sm">Total de Métricas</p>
                            <p className="text-2xl font-bold text-white mt-1">{metrics.length}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-400 text-sm">Métricas Configuradas</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {metrics.filter((m) => m.description).length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Modal de creación/edición */}
                <MetricModal resources={resources} />
            </div>
        </div>
    );
};
