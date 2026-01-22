import { useState, useEffect } from 'react';
import { authAPI } from '../services/authService';
import { showToast } from '../utils/toast';
import { UserWithMetadata, RegisterData } from '../types/auth';
import { useResources } from '../hooks/useResources';
import { ResourceSelector } from '../components/ResourceSelector';
import { usePagination } from '../hooks/usePagination';
import { SearchInput } from '../components/SearchInput';
import { PaginationControls } from '../components/PaginationControls';
import { TableSkeleton } from '../components/TableSkeleton';
import { PageHeader } from '../components/PageHeader';
import type { PaginationMeta } from '../types/pagination';

export function UsersAdminPage() {
    const [users, setUsers] = useState<UserWithMetadata[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const pagination = usePagination(10);
    const { resources, loading: loadingResources } = useResources();
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

    // Formulario de creación
    const [formData, setFormData] = useState<RegisterData>({
        email: '',
        password: '',
        name: '',
        role: 'user',
    });

    useEffect(() => {
        loadUsers();
    }, [pagination.params]);

    // Preseleccionar el primer recurso cuando se cargan los recursos y el rol es 'user'
    useEffect(() => {
        if (!loadingResources && resources.length > 0 && formData.role === 'user' && !selectedResourceId) {
            setSelectedResourceId(resources[0].id);
        }
    }, [loadingResources, resources, formData.role, selectedResourceId]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const response = await authAPI.getAllUsersPaginated(pagination.params);
            setUsers(response.data);
            setMeta(response.meta);
        } catch (error) {
            showToast('Error al cargar usuarios', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData } as RegisterData;
            if (selectedResourceId && formData.role === 'user') {
                payload.resourceProfile = { resourceId: selectedResourceId };
            }
            await authAPI.createUser(payload);
            showToast('Usuario creado exitosamente', 'success');
            setShowCreateModal(false);
            setFormData({ email: '', password: '', name: '', role: 'user' });
            setSelectedResourceId(null);
            loadUsers();
        } catch (error: any) {
            showToast(error.message || 'Error al crear usuario', 'error');
        }
    };

    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await authAPI.updateUser(userId, { isActive: !currentStatus });
            showToast(
                `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`,
                'success'
            );
            loadUsers();
        } catch (error: any) {
            showToast(error.message || 'Error al actualizar usuario', 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción eliminará al usuario permanentemente.')) return;

        try {
            // Hard delete desde la gestión de usuarios
            await authAPI.deleteUser(userId, true);
            showToast('Usuario eliminado exitosamente', 'success');
            loadUsers();
        } catch (error: any) {
            showToast(error.message || 'Error al eliminar usuario', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Gestión de Usuarios"
                    description="Administra usuarios del sistema, crea nuevas cuentas y gestiona permisos"
                    action={{
                        label: 'Nuevo Usuario',
                        onClick: () => setShowCreateModal(true),
                    }}
                />

                {/* Búsqueda */}
                <div className="mb-6">
                    <SearchInput
                        value={pagination.search}
                        onChange={pagination.setSearch}
                        placeholder="Buscar por nombre, email o rol..."
                        className="max-w-md"
                    />
                </div>

                {/* Tabla de usuarios */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500 ease-in-out">
                    {isLoading && <TableSkeleton columns={5} rows={6} showActions={true} />}

                    {!isLoading && (
                        <table className="w-full fade-in">
                            <thead className="bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Último acceso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 ease-in-out">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-gray-900 dark:text-white font-medium">{user.name}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin'
                                                    ? 'bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white'
                                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                                                    }`}
                                            >
                                                {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${user.isActive
                                                    ? 'bg-green-100 dark:bg-green-600 text-green-700 dark:text-white'
                                                    : 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white'
                                                    }`}
                                            >
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                            {user.lastLogin
                                                ? new Date(user.lastLogin).toLocaleDateString()
                                                : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                                    className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                    title={user.isActive ? 'Desactivar' : 'Activar'}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && users.length === 0 && (
                        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                            {pagination.search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                        </div>
                    )}

                    {/* Controles de paginación */}
                    {!isLoading && users.length > 0 && (
                        <PaginationControls
                            meta={meta}
                            page={pagination.page}
                            pageSize={pagination.pageSize}
                            onPageSizeChange={pagination.setPageSize}
                            onPrevPage={pagination.prevPage}
                            onNextPage={pagination.nextPage}
                        />
                    )}
                </div>
            </div>

            {/* Modal Crear Usuario */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nuevo Usuario</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rol
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => {
                                        const newRole = e.target.value as 'admin' | 'user';
                                        setFormData({ ...formData, role: newRole });
                                        // Si cambia a 'user' y hay recursos, preseleccionar el primero
                                        if (newRole === 'user' && resources.length > 0 && !selectedResourceId) {
                                            setSelectedResourceId(resources[0].id);
                                        }
                                        // Si cambia a 'admin', limpiar selección
                                        if (newRole === 'admin') {
                                            setSelectedResourceId(null);
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            {/* Selector de recurso: preseleccionado y deshabilitado cuando el rol es 'user' */}
                            {formData.role === 'user' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Recurso asociado
                                    </label>
                                    <ResourceSelector
                                        selectedId={selectedResourceId}
                                        onSelect={(id) => setSelectedResourceId(id)}
                                        loading={loadingResources}
                                        disabled={true}
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        El recurso se asigna automáticamente para usuarios con rol "Usuario"
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Crear Usuario
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({ email: '', password: '', name: '', role: 'user' });
                                        setSelectedResourceId(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
