/**
 * ResourcesPage - Gestión de recursos (desarrolladores, líderes técnicos, etc.)
 * CRUD completo con componentes reutilizables
 */
import { useEffect, useState, useCallback } from 'react';
import { useResourcesStore } from '../stores/resourcesStore';
import { useMetricsStore } from '../stores/metricsStore';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { PageHeader } from '../components/PageHeader';
import { PermissionFeedback } from '../components/PermissionFeedback';
import { useAuth } from '../contexts/AuthContext';
import { ResourceModal } from '../components/ResourceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TableSkeleton } from '../components/TableSkeleton';
import { ResourceFormData } from '../schemas/resourceFormSchema';
import { Resource, apiClient, resourcesApi } from '../services/apiClient';
import { useToast } from '../hooks/useToast';
import { PaginationControls } from '../components/PaginationControls';
import { SearchInput } from '../components/SearchInput';

const ROLE_TYPE_LABELS: Record<string, string> = {
    DEV: 'Desarrollador',
    TL: 'Líder Técnico',
    OTHER: 'Otro',
};

export const ResourcesPage: React.FC = () => {
    const { user } = useAuth();

    // Bloquear acceso para usuarios con rol 'user'
    if (user?.role === 'user') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PageHeader
                        title="Recursos"
                        description="Gestiona los recursos del equipo (desarrolladores, líderes técnicos, etc.)"
                    />
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                        <PermissionFeedback
                            title="Acceso restringido"
                            message="No tienes permisos para acceder a este módulo. Solo los administradores pueden gestionar recursos."
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Estado local de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Memorizar fetchFn para evitar re-renders innecesarios
    const fetchResources = useCallback((params: any) => resourcesApi.getPaginated(params), []);

    // Hook genérico para datos paginados
    const { 
        data: resources, 
        meta, 
        loading, 
        error, 
        reload, 
        pagination 
    } = usePaginatedData<Resource>({
        fetchFn: fetchResources,
        initialPageSize: 10,
    });

    // Estado para estadísticas globales
    const [stats, setStats] = useState({
        totalResources: 0,
        activeResources: 0,
        devResources: 0,
        tlResources: 0,
    });

    // Zustand solo para crear/actualizar/eliminar
    const {
        createResource,
        updateResource,
        deleteResource,
    } = useResourcesStore();

    const { metrics, fetchMetrics } = useMetricsStore();
    const { confirm, ...confirmModalProps } = useConfirmModal();
    const { success, error: showError } = useToast();

    // Cargar estadísticas globales independientemente de la paginación
    const loadStats = useCallback(async () => {
        try {
            console.log('[ResourcesPage] Cargando stats...');
            const statsData = await apiClient.getResourcesStats();
            console.log('[ResourcesPage] Stats cargados:', statsData);
            setStats(statsData);
        } catch (err) {
            console.error('[ResourcesPage] Error al cargar estadísticas:', err);
        }
    }, []);

    // Cargar métricas y stats solo al montar
    useEffect(() => {
        fetchMetrics();
        loadStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenModal = (resource?: Resource) => {
        setEditingResource(resource || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingResource(null);
    };

    const handleSubmit = async (data: ResourceFormData) => {
        setIsSubmitting(true);
        try {
            if (editingResource) {
                await updateResource(editingResource.id, data);
                success('Recurso actualizado correctamente');
            } else {
                await createResource(data);
                success('Recurso creado correctamente');
            }
            handleCloseModal();
            await reload(); // Usar reload del hook
            await loadStats(); // Recargar estadísticas
        } catch (err) {
            console.error('Error al guardar recurso:', err);
            showError(err instanceof Error ? err.message : 'Error al guardar el recurso');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (resource: Resource) => {
        const confirmed = await confirm({
            title: '¿Eliminar recurso?',
            message: `¿Estás seguro de que deseas eliminar a "${resource.name}"? Esta acción no se puede deshacer.`,
            variant: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
        });

        if (confirmed) {
            setDeletingId(resource.id);
            try {
                await deleteResource(resource.id);
                success('Recurso eliminado correctamente');
                await reload(); // Usar reload del hook
                await loadStats(); // Recargar estadísticas
            } catch (err) {
                showError('Error al eliminar el recurso');
            } finally {
                setDeletingId(null);
                confirmModalProps.closeModal();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Recursos"
                    description="Gestiona los recursos del equipo (desarrolladores, líderes técnicos, etc.)"
                    action={{
                        label: 'Crear Recurso',
                        onClick: () => handleOpenModal(),
                    }}
                />

                {/* Estadísticas */}
                {stats.totalResources > 0 && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 fade-in">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700/50 p-4 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600">
                            <p className="text-blue-600 dark:text-blue-300 text-sm font-medium">Total de Recursos</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalResources}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700/50 p-4 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:border-green-300 dark:hover:border-green-600">
                            <p className="text-green-600 dark:text-green-300 text-sm font-medium">Recursos Activos</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeResources}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700/50 p-4 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600">
                            <p className="text-purple-600 dark:text-purple-300 text-sm font-medium">Desarrolladores</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.devResources}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-lg border border-orange-700/50 p-4 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:border-orange-600">
                            <p className="text-orange-600 dark:text-orange-300 text-sm font-medium">Líderes Técnicos</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.tlResources}</p>
                        </div>
                    </div>
                )}

                {/* Barra de búsqueda */}
                <div className="mb-6">
                    <SearchInput
                        value={pagination.search}
                        onChange={pagination.setSearch}
                        placeholder="Buscar por nombre, rol o ID..."
                    />
                </div>

                {/* Tabla de recursos */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500 ease-in-out min-h-[500px]">
                    {loading && <TableSkeleton rows={5} columns={5} />}

                    {error && (
                        <PermissionFeedback
                            message={typeof error === 'string' ? error : String(error)}
                            onRetry={reload}
                        />
                    )}

                    {!loading && !error && meta.totalItems === 0 && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-600 dark:text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">No hay recursos registrados</p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                Crear el primer recurso
                            </button>
                        </div>
                    )}

                    {!loading && !error && resources.length > 0 && (
                        <table className="w-full fade-in">
                            <thead className="bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {resources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">
                                                        {resource.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                            .slice(0, 2)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{resource.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${resource.roleType === 'DEV'
                                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                                    : resource.roleType === 'TL'
                                                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                                        : 'bg-gray-700/50 text-gray-300'
                                                    }`}
                                            >
                                                {ROLE_TYPE_LABELS[resource.roleType] || resource.roleType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${resource.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                    : 'bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                {resource.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">{resource.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(resource)}
                                                    className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 ease-in-out hover:scale-105"
                                                    title="Editar recurso"
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
                                                    onClick={() => handleDelete(resource)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Eliminar recurso"
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

                    {!loading && !error && resources.length > 0 && (
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
            </div>

            {/* Modal de Crear/Editar */}
            <ResourceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                resource={editingResource}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                metrics={metrics}
            />

            {/* Modal de Confirmación (reutilizable) */}
            <ConfirmModal
                isOpen={confirmModalProps.isOpen}
                isLoading={deletingId !== null}
                onClose={confirmModalProps.handleClose}
                onConfirm={confirmModalProps.handleConfirm}
                title={confirmModalProps.options.title}
                message={confirmModalProps.options.message}
                variant={confirmModalProps.options.variant}
                confirmText={confirmModalProps.options.confirmText}
                cancelText={confirmModalProps.options.cancelText}
            />
        </div>
    );
};
