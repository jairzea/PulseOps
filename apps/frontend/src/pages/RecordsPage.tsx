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
import { PermissionFeedback } from '../components/PermissionFeedback';
import { useAuth } from '../contexts/AuthContext';
import { Autocomplete } from '../components/Autocomplete';
import { ConfirmModal } from '../components/ConfirmModal';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { useToast } from '../hooks/useToast';
import type { Record as MetricRecord } from '../services/apiClient';

export const RecordsPage: React.FC = () => {
    const { user } = useAuth();

    // Bloquear acceso para usuarios con rol 'user'
    if (user?.role === 'user') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PageHeader
                        title="Registros"
                        description="Gestiona los registros de métricas por recurso y semana"
                    />
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                        <PermissionFeedback
                            title="Acceso restringido"
                            message="No tienes permisos para acceder a este módulo. Solo los administradores pueden gestionar registros."
                        />
                    </div>
                </div>
            </div>
        );
    }

    const { records, loading, error: recordsError, fetchRecords, setModalOpen, setEditingRecord, deleteRecord } = useRecordsStore();
    const { resources, error: resourcesError } = useResources();
    const { metrics, error: metricsError } = useMetrics();
    const { confirm, ...confirmModalProps } = useConfirmModal();
    const { success, error: showError } = useToast();

    const [selectedResourceId, setSelectedResourceId] = useState<string>('');
    const [selectedMetricKey, setSelectedMetricKey] = useState<string>('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const handleEdit = (record: MetricRecord) => {
        setEditingRecord(record);
    };

    const handleDelete = async (record: MetricRecord) => {
        const metricLabel = metrics.find(m => m.key === record.metricKey)?.label || record.metricKey;
        const resourceName = resources.find(r => r.id === record.resourceId)?.name || 'Recurso';

        const confirmed = await confirm({
            title: '¿Eliminar registro?',
            message: `¿Estás seguro de que deseas eliminar el registro de "${metricLabel}" para ${resourceName} en la semana ${record.week}? Esta acción no se puede deshacer.`,
            variant: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
        });

        if (confirmed) {
            setDeletingId(record.id);
            try {
                await deleteRecord(record.id);
                success('Registro eliminado correctamente');
            } catch (err) {
                showError('Error al eliminar el registro');
            } finally {
                setDeletingId(null);
                confirmModalProps.closeModal();
            }
        }
    };

    // Determinar si existe un error de permisos en cualquiera de las fuentes
    const candidateErrors = [recordsError, resourcesError, metricsError];
    const permissionError = candidateErrors.find(e => !!e && ((e as any).statusCode === 403 || (e as any).code === 'FORBIDDEN')) as Error | undefined;

    const permissionMessage = permissionError
        ? (typeof (permissionError as any).getUserMessage === 'function'
            ? (permissionError as any).getUserMessage()
            : permissionError.message || 'No tienes permisos para ver este módulo')
        : null;

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

                {permissionError ? (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                        <PermissionFeedback
                            message={permissionMessage || 'No tienes permisos para ver este módulo'}
                            onRetry={() => {
                                if (selectedResourceId && selectedMetricKey) {
                                    fetchRecords({ resourceId: selectedResourceId, metricKey: selectedMetricKey });
                                } else {
                                    fetchRecords({});
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        {/* Filtros */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 transition-colors duration-300 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Selector de Recurso */}
                                <div>
                                    <label
                                        htmlFor="resource"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Recurso
                                    </label>
                                    <Autocomplete
                                        options={resources.map(resource => ({
                                            value: resource.id,
                                            label: resource.name,
                                            description: resource.roleType,
                                        }))}
                                        value={selectedResourceId}
                                        onChange={setSelectedResourceId}
                                        placeholder="Seleccionar recurso..."
                                    />
                                </div>

                                {/* Selector de Métrica */}
                                <div>
                                    <label
                                        htmlFor="metric"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                    >
                                        Métrica
                                    </label>
                                    <Autocomplete
                                        options={metrics.map(metric => ({
                                            value: metric.key,
                                            label: metric.label,
                                            description: metric.description,
                                        }))}
                                        value={selectedMetricKey}
                                        onChange={setSelectedMetricKey}
                                        placeholder="Seleccionar métrica..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabla de registros */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                            {!selectedResourceId || !selectedMetricKey ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Selecciona un recurso y una métrica para ver los registros
                                    </p>
                                </div>
                            ) : loading ? (
                                <div className="p-12">
                                    <PulseLoader size="lg" variant="success" text="Cargando registros..." />
                                </div>
                            ) : records.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No hay registros para esta combinación
                                    </p>
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
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(record)}
                                                            disabled={deletingId === record.id}
                                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Editar registro"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(record)}
                                                            disabled={deletingId === record.id}
                                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Eliminar registro"
                                                        >
                                                            {deletingId === record.id ? (
                                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                        {records.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Registros</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {records.length}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Valor Promedio</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {(records.reduce((acc, r) => acc + r.value, 0) / records.length).toFixed(1)}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Último Valor</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {records[records.length - 1]?.value || 0}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal de formulario */}
                <RecordModal resources={resources} />

                {/* Modal de confirmación */}
                <ConfirmModal
                    isOpen={confirmModalProps.isOpen}
                    onClose={confirmModalProps.handleClose}
                    onConfirm={confirmModalProps.handleConfirm}
                    title={confirmModalProps.options.title}
                    message={confirmModalProps.options.message}
                    confirmText={confirmModalProps.options.confirmText}
                    cancelText={confirmModalProps.options.cancelText}
                    variant={confirmModalProps.options.variant}
                    isLoading={deletingId !== null}
                />
            </div>
        </div>
    )
};