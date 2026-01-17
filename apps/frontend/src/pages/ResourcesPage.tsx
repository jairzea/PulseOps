/**
 * ResourcesPage - Gestión de recursos (desarrolladores, líderes técnicos, etc.)
 * CRUD completo con componentes reutilizables
 */
import { useEffect, useState } from 'react';
import { useResourcesStore } from '../stores/resourcesStore';
import { useMetricsStore } from '../stores/metricsStore';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { PageHeader } from '../components/PageHeader';
import { ResourceModal } from '../components/ResourceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TableSkeleton } from '../components/TableSkeleton';
import { ResourceFormData } from '../schemas/resourceFormSchema';
import { Resource } from '../services/apiClient';

const ROLE_TYPE_LABELS: Record<string, string> = {
    DEV: 'Desarrollador',
    TL: 'Líder Técnico',
    OTHER: 'Otro',
};

export const ResourcesPage: React.FC = () => {
    // Estado local de UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Zustand solo para datos globales
    const {
        resources,
        loading,
        error,
        fetchResources,
        createResource,
        updateResource,
        deleteResource,
    } = useResourcesStore();

    const { metrics, fetchMetrics } = useMetricsStore();
    const { confirm, ...confirmModalProps } = useConfirmModal();

    useEffect(() => {
        fetchResources();
        fetchMetrics();
    }, [fetchResources, fetchMetrics]);

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
            } else {
                await createResource(data);
            }
            handleCloseModal();
        } catch (err) {
            console.error('Error al guardar recurso:', err);
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
            await deleteResource(resource.id);
        }
    };

    const activeResources = resources.filter((r) => r.isActive);
    const devResources = resources.filter((r) => r.roleType === 'DEV');
    const tlResources = resources.filter((r) => r.roleType === 'TL');

    return (
        <div className="min-h-screen bg-gray-950 text-white">
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
                {!loading && !error && resources.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-lg border border-blue-700/50 p-4">
                            <p className="text-blue-300 text-sm font-medium">Total de Recursos</p>
                            <p className="text-3xl font-bold text-white mt-2">{resources.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-lg border border-green-700/50 p-4">
                            <p className="text-green-300 text-sm font-medium">Recursos Activos</p>
                            <p className="text-3xl font-bold text-white mt-2">{activeResources.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-lg border border-purple-700/50 p-4">
                            <p className="text-purple-300 text-sm font-medium">Desarrolladores</p>
                            <p className="text-3xl font-bold text-white mt-2">{devResources.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-lg border border-orange-700/50 p-4">
                            <p className="text-orange-300 text-sm font-medium">Líderes Técnicos</p>
                            <p className="text-3xl font-bold text-white mt-2">{tlResources.length}</p>
                        </div>
                    </div>
                )}

                {/* Tabla de recursos */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    {loading && <TableSkeleton rows={5} columns={5} />}

                    {error && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
                                <svg
                                    className="w-8 h-8 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-red-500 font-medium mb-2">Error al cargar recursos</p>
                            <p className="text-gray-400 text-sm">{error || 'Error desconocido'}</p>
                            <button
                                onClick={() => fetchResources()}
                                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {!loading && !error && resources.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
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
                            <p className="text-gray-400 mb-4">No hay recursos registrados</p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                Crear el primer recurso
                            </button>
                        </div>
                    )}

                    {!loading && !error && resources.length > 0 && (
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {resources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-gray-800/50 transition-colors">
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
                                                    <div className="text-sm font-medium text-white">{resource.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${resource.roleType === 'DEV'
                                                    ? 'bg-blue-900/50 text-blue-300'
                                                    : resource.roleType === 'TL'
                                                        ? 'bg-purple-900/50 text-purple-300'
                                                        : 'bg-gray-700/50 text-gray-300'
                                                    }`}
                                            >
                                                {ROLE_TYPE_LABELS[resource.roleType] || resource.roleType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${resource.isActive
                                                    ? 'bg-green-900/50 text-green-300'
                                                    : 'bg-gray-700/50 text-gray-400'
                                                    }`}
                                            >
                                                {resource.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-400 font-mono">{resource.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(resource)}
                                                    className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
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
            <ConfirmModal {...confirmModalProps} />
        </div>
    );
};
