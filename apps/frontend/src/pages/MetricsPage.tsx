/**
 * MetricsPage - Gestión de métricas
 */
import { useEffect, useState } from 'react';
import { useMetricsStore } from '../stores/metricsStore';
import { useResources } from '../hooks/useResources';
import { MetricModal } from '../components/MetricModal';
import { TableSkeleton } from '../components/TableSkeleton';
import { ShredderLoaderInline } from '../components/ShredderLoader';

export const MetricsPage: React.FC = () => {
    const { metrics, loading, error, setModalOpen, setEditingMetric, fetchMetrics, deleteMetric } = useMetricsStore();
    const { resources } = useResources();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const handleEdit = (metric: any) => {
        setEditingMetric(metric);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta métrica?')) {
            setDeletingId(id);
            try {
                await deleteMetric(id);
            } finally {
                setDeletingId(null);
            }
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
                    {loading && <TableSkeleton columns={5} rows={6} showActions={true} />}

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
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(metric)}
                                                    className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar métrica"
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
                                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(metric.id)}
                                                    disabled={deletingId === metric.id}
                                                    className={`p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:cursor-not-allowed relative ${deletingId === metric.id ? '' : 'disabled:opacity-50'}`}
                                                    title="Eliminar métrica"
                                                >
                                                    {deletingId === metric.id ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg -m-2 p-2">
                                                            <div className="w-10 h-10" style={{ filter: 'hue-rotate(200deg) saturate(1.5)' }}>
                                                                <ShredderLoaderInline size="md" variant="danger" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
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
