/**
 * ResourcesPage - Gestión de recursos (desarrolladores, líderes técnicos, etc.)
 */
import { useState } from 'react';
import { useResources } from '../hooks/useResources';

export const ResourcesPage: React.FC = () => {
    const { resources, loading, error } = useResources();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header de la página */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Recursos</h1>
                        <p className="text-gray-400 mt-1">
                            Gestiona los recursos del equipo (desarrolladores, líderes técnicos, etc.)
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
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
                        Crear Recurso
                    </button>
                </div>

                {/* Tabla de recursos */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                    {loading && (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-400">Cargando recursos...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-8 text-center">
                            <p className="text-red-500">Error al cargar recursos: {error?.message || 'Error desconocido'}</p>
                        </div>
                    )}

                    {!loading && !error && resources.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-400">No hay recursos registrados</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 text-blue-500 hover:text-blue-400 transition-colors"
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
                                            <div className="text-sm font-medium text-white">{resource.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/50 text-blue-300">
                                                {resource.roleType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400 font-mono">{resource.id}</div>
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
                {!loading && !error && resources.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-400 text-sm">Total de Recursos</p>
                            <p className="text-2xl font-bold text-white mt-1">{resources.length}</p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-400 text-sm">Desarrolladores</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {resources.filter((r) => r.roleType === 'DEV').length}
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                            <p className="text-gray-400 text-sm">Líderes Técnicos</p>
                            <p className="text-2xl font-bold text-white mt-1">
                                {resources.filter((r) => r.roleType === 'TL').length}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* TODO: Modal de formulario (ResourceForm + ResourceModal) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Crear Recurso</h2>
                        <p className="text-gray-400">Formulario pendiente de implementación</p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
