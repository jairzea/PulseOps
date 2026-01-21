/**
 * MetricsPage - Gestión de métricas
 */
import { useEffect, useState } from 'react';
import { useMetricsStore } from '../stores/metricsStore';
import { useResources } from '../hooks/useResources';
import { MetricModal } from '../components/MetricModal';
import { TableSkeleton } from '../components/TableSkeleton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { PageHeader } from '../components/PageHeader';
import { PermissionFeedback } from '../components/PermissionFeedback';
import { useAuth } from '../contexts/AuthContext';
import { Metric, apiClient } from '../services/apiClient';
import { useToast } from '../hooks/useToast';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/PaginationControls';
import { SearchInput } from '../components/SearchInput';
import type { PaginationMeta } from '../types/pagination';

export const MetricsPage: React.FC = () => {
    const { user } = useAuth();

    // Bloquear acceso para usuarios con rol 'user'
    if (user?.role === 'user') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PageHeader
                        title="Métricas"
                        description="Gestiona las métricas del sistema (Story Points, Performance, Integraciones, etc.)"
                    />
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                        <PermissionFeedback
                            title="Acceso restringido"
                            message="No tienes permisos para acceder a este módulo. Solo los administradores pueden gestionar métricas."
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Estado local de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Estado local para datos paginados del servidor
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
    });

    // Zustand solo para eliminar
    const { deleteMetric } = useMetricsStore();
    const { resources } = useResources();
    const confirmModal = useConfirmModal();
    const { success, error: showError } = useToast();
    const pagination = usePagination(10);

    // Cargar métricas paginadas del servidor
    const loadMetrics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.getMetricsPaginated(pagination.params);
            setMetrics(response.data);
            setMeta(response.meta);
        } catch (err) {
            console.error('Error al cargar métricas:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar métricas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [pagination.params]);

    const handleEdit = (metric: Metric) => {
        setEditingMetric(metric);
        setIsModalOpen(true);
    };

    const handleCloseModal = async (reload = false) => {
        setIsModalOpen(false);
        setEditingMetric(null);
        if (reload) {
            await loadMetrics(); // Recargar datos si se guardó
        }
    };

    const handleDelete = async (id: string, metricName: string) => {
        const confirmed = await confirmModal.confirm({
            variant: 'danger',
            title: 'Eliminar métrica',
            message: `¿Estás seguro de que deseas eliminar la métrica "${metricName}"? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
        });

        if (confirmed) {
            setDeletingId(id);
            try {
                await deleteMetric(id);
                success('Métrica eliminada correctamente');
                await loadMetrics(); // Recargar datos del servidor
            } catch (err) {
                showError('Error al eliminar la métrica');
            } finally {
                setDeletingId(null);
                confirmModal.closeModal();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Métricas"
                    description="Gestiona las métricas del sistema (Story Points, Performance, Integraciones, etc.)"
                    action={{
                        label: 'Crear Métrica',
                        onClick: () => setIsModalOpen(true),
                    }}
                />

                {/* Barra de búsqueda */}
                <div className="mb-6">
                    <SearchInput
                        value={pagination.search}
                        onChange={pagination.setSearch}
                        placeholder="Buscar por etiqueta, clave o descripción..."
                    />
                </div>

                {/* Tabla de métricas */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500 ease-in-out min-h-[500px]">
                    {loading && <TableSkeleton columns={5} rows={6} showActions={true} />}

                    {error && (
                        <PermissionFeedback
                            message={typeof error === 'string' ? error : String(error)}
                            onRetry={loadMetrics}
                        />
                    )}

                    {!loading && !error && meta.totalItems === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-400">No hay métricas registradas</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                Crear la primera métrica
                            </button>
                        </div>
                    )}

                    {!loading && !error && metrics.length > 0 && (
                        <table className="w-full fade-in">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Etiqueta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Clave
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Unidad
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {metrics.map((metric) => (
                                    <tr key={metric.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{metric.label}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-mono rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                                {metric.key}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                                {metric.description || 'Sin descripción'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{metric.unit || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(metric)}
                                                    className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 ease-in-out hover:scale-105"
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
                                                    onClick={() => handleDelete(metric.id, metric.label)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Eliminar métrica"
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
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && !error && metrics.length > 0 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <PaginationControls
                                meta={meta}
                                page={pagination.page}
                                pageSize={pagination.pageSize}
                                onPageSizeChange={pagination.setPageSize}
                                onPrevPage={pagination.prevPage}
                                onNextPage={pagination.nextPage}
                            />
                        </div>
                    )}
                </div>

                {/* Estadísticas */}
                {!loading && !error && meta.totalItems > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 fade-in">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Métricas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{meta.totalItems}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Métricas Configuradas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {metrics.filter((m) => m.description).length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Modal de creación/edición */}
                <MetricModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    editingMetric={editingMetric}
                    resources={resources}
                />

                {/* Modal de confirmación */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    isLoading={deletingId !== null}
                    title={confirmModal.options.title}
                    message={confirmModal.options.message}
                    confirmText={confirmModal.options.confirmText}
                    cancelText={confirmModal.options.cancelText}
                    variant={confirmModal.options.variant}
                    onClose={confirmModal.handleClose}
                    onConfirm={confirmModal.handleConfirm}
                />
            </div>
        </div>
    );
};
