/**
 * RecordForm - Formulario con React Hook Form + Yup
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Resource, Metric, Record as MetricRecord } from '../services/apiClient';
import { apiClient } from '../services/apiClient';
import { Autocomplete } from './Autocomplete';
import * as yup from 'yup';

interface RecordFormProps {
    resources: Resource[];
    onSubmit: (data: RecordFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    initialRecord?: MetricRecord | null;
}

interface RecordFormData {
    resourceId: string;
    date: string;
    metricValues: Record<string, number>;
}

// Schema de validación dinámico
const createRecordSchema = (hasMetrics: boolean) => {
    return yup.object({
        resourceId: yup.string().required('Debes seleccionar un recurso'),
        date: yup.string().required('Debes seleccionar una fecha'),
        metricValues: hasMetrics
            ? yup.object().test(
                'at-least-one-value',
                'Debes ingresar al menos un valor',
                (values) => {
                    if (!values) return false;
                    return Object.values(values).some(v => v !== null && v !== undefined && v !== 0);
                }
            )
            : yup.object(),
    });
};

// Función para calcular el número de semana
const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Función para formatear fecha a formato ISO week
const formatToISOWeek = (date: Date): string => {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
};

export const RecordForm: React.FC<RecordFormProps> = ({
    resources,
    onSubmit,
    onCancel,
    isSubmitting = false,
    initialRecord = null,
}) => {
    const isEditing = !!initialRecord;

    const [selectedResourceId, setSelectedResourceId] = useState<string>(initialRecord?.resourceId || '');
    const [resourceMetrics, setResourceMetrics] = useState<Metric[]>([]);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(
        initialRecord?.timestamp ? new Date(initialRecord.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<RecordFormData>({
        resolver: yupResolver(createRecordSchema(resourceMetrics.length > 0)) as any,
        defaultValues: {
            resourceId: initialRecord?.resourceId || '',
            date: initialRecord?.timestamp ? new Date(initialRecord.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            metricValues: {},
        },
    });

    const watchedResourceId = watch('resourceId');

    // Cargar métricas cuando se selecciona un recurso
    useEffect(() => {
        const loadResourceMetrics = async () => {
            if (!selectedResourceId) {
                setResourceMetrics([]);
                return;
            }

            setLoadingMetrics(true);
            try {
                const metrics = await apiClient.getResourceMetrics(selectedResourceId);
                setResourceMetrics(metrics);

                // Inicializar valores de métricas
                const initialValues: Record<string, number> = {};
                metrics.forEach(metric => {
                    // Si estamos editando y la métrica coincide con el registro, usar su valor
                    if (isEditing && initialRecord && metric.key === initialRecord.metricKey) {
                        initialValues[metric.key] = initialRecord.value;
                    } else {
                        initialValues[metric.key] = 0;
                    }
                });
                setValue('metricValues', initialValues);
            } catch (error) {
                console.error('Error al cargar métricas:', error);
                setResourceMetrics([]);
            } finally {
                setLoadingMetrics(false);
            }
        };

        loadResourceMetrics();
    }, [selectedResourceId, setValue, isEditing, initialRecord]);

    // Actualizar selectedResourceId cuando cambia en el formulario
    useEffect(() => {
        if (watchedResourceId !== selectedResourceId) {
            setSelectedResourceId(watchedResourceId);
        }
    }, [watchedResourceId, selectedResourceId]);

    // Calcular semana del año
    const weekNumber = selectedDate ? getWeekNumber(new Date(selectedDate)) : 0;
    const year = selectedDate ? new Date(selectedDate).getFullYear() : new Date().getFullYear();

    const handleFormSubmit = (data: RecordFormData) => {
        // Transformar los datos al formato esperado por el backend
        const date = new Date(data.date);
        const week = formatToISOWeek(date);

        onSubmit({
            ...data,
            week,
            timestamp: date.toISOString(),
        } as any);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Paso 1: Selección de Recurso */}
            <div>
                <label htmlFor="resourceId" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    1. Selecciona el Recurso *
                </label>
                <Autocomplete
                    options={resources.filter(r => r.isActive).map(resource => ({
                        value: resource.id,
                        label: resource.name,
                        description: resource.roleType
                    }))}
                    value={selectedResourceId}
                    onChange={(value) => {
                        setValue('resourceId', value);
                        setSelectedResourceId(value);
                    }}
                    placeholder="Seleccionar recurso..."
                    disabled={isSubmitting || isEditing}
                    error={!!errors.resourceId}
                />
                {isEditing && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        No se puede cambiar el recurso al editar un registro
                    </p>
                )}
                {errors.resourceId && (
                    <p className="mt-1 text-sm text-red-500">{errors.resourceId.message}</p>
                )}
            </div>

            {/* Paso 2: Selección de Fecha y Semana */}
            {selectedResourceId && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                            2. Selecciona la Fecha del Registro *
                        </label>
                        <input
                            type="date"
                            id="date"
                            {...register('date')}
                            disabled={isSubmitting}
                            onChange={(e) => {
                                setValue('date', e.target.value);
                                setSelectedDate(e.target.value);
                            }}
                            className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                        />
                        {isEditing && initialRecord && initialRecord.timestamp && selectedDate !== new Date(initialRecord.timestamp).toISOString().split('T')[0] && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <svg
                                        className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Fecha original del registro
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Fecha anterior:</span>{' '}
                                            {new Date(initialRecord.timestamp).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            <span className="font-medium">Semana:</span> {initialRecord.week}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Información de la Semana */}
                        {selectedDate && !isEditing && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Registrando valores para la <span className="font-semibold">Semana {weekNumber}</span> del año {year}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Paso 3: Valores de Métricas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                            3. Ingresa los Valores de las Métricas
                        </label>

                        {loadingMetrics ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando métricas...</span>
                            </div>
                        ) : resourceMetrics.length === 0 ? (
                            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Este recurso no tiene métricas asociadas. Por favor, asigna métricas al recurso primero.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                {resourceMetrics.map((metric) => (
                                    <div key={metric.key} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label
                                                htmlFor={`metric-${metric.key}`}
                                                className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
                                            >
                                                {metric.label}
                                                {metric.description && (
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        ({metric.description})
                                                    </span>
                                                )}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    id={`metric-${metric.key}`}
                                                    {...register(`metricValues.${metric.key}`, {
                                                        valueAsNumber: true,
                                                    })}
                                                    disabled={isSubmitting}
                                                    step="any"
                                                    placeholder="0"
                                                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                                />
                                                {metric.unit && (
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
                                                        {metric.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {errors.metricValues && (
                                    <p className="mt-2 text-sm text-red-500">
                                        {(errors.metricValues as any)?.message || 'Debes ingresar al menos un valor'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Fuente (siempre Manual) */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Fuente: <span className="font-medium text-gray-900 dark:text-white">Manual</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !selectedResourceId || loadingMetrics || resourceMetrics.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Registro' : 'Crear Registro')}
                </button>
            </div>
        </form>
    );
};
