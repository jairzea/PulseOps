/**
 * ResourceForm - Formulario reutilizable para crear/editar recursos
 */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, ResourceFormData } from '../schemas/resourceFormSchema';
import { Resource, Metric, apiClient } from '../services/apiClient';

interface ResourceFormProps {
    resource?: Resource | null;
    onSubmit: (data: ResourceFormData) => void | Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    metrics?: Metric[];
}

const ROLE_TYPES = [
    { value: 'DEV', label: 'Desarrollador' },
    { value: 'TL', label: 'Líder Técnico' },
    { value: 'OTHER', label: 'Otro' },
] as const;

export const ResourceForm: React.FC<ResourceFormProps> = ({
    resource,
    onSubmit,
    onCancel,
    isSubmitting = false,
    metrics = [],
}) => {
    const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ResourceFormData>({
        resolver: zodResolver(resourceFormSchema) as any,
        defaultValues: {
            name: resource?.name || '',
            roleType: resource?.roleType || 'DEV',
            isActive: resource?.isActive ?? true,
            metricIds: [],
        },
    });

    // Filtrar métricas según búsqueda
    const filteredMetrics = metrics.filter(
        (metric) =>
            !selectedMetrics.find((sm) => sm.id === metric.id) &&
            (metric.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                metric.key.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Agregar métrica seleccionada
    const addMetric = (metric: Metric) => {
        const newSelected = [...selectedMetrics, metric];
        setSelectedMetrics(newSelected);
        setValue(
            'metricIds',
            newSelected.map((m) => m.id)
        );
        setSearchTerm('');
        setShowDropdown(false);
    };

    // Remover métrica seleccionada
    const removeMetric = (metricId: string) => {
        const newSelected = selectedMetrics.filter((m) => m.id !== metricId);
        setSelectedMetrics(newSelected);
        setValue(
            'metricIds',
            newSelected.map((m) => m.id)
        );
    };

    // Reset form when resource changes
    useEffect(() => {
        if (resource) {
            // Las métricas asociadas se obtendrán desde el endpoint /resources/:id/metrics
            // Para editar, cargamos las métricas usando el nuevo endpoint
            const loadAssociatedMetrics = async () => {
                try {
                    const associatedMetrics = await apiClient.getResourceMetrics(resource.id);
                    setSelectedMetrics(associatedMetrics);
                    setValue(
                        'metricIds',
                        associatedMetrics.map((m) => m.id)
                    );
                } catch (error) {
                    console.error('Error cargando métricas asociadas:', error);
                    setSelectedMetrics([]);
                }
            };

            reset({
                name: resource.name,
                roleType: resource.roleType,
                isActive: resource.isActive,
                metricIds: [],
            });

            loadAssociatedMetrics();
        } else {
            reset({
                name: '',
                roleType: 'DEV',
                isActive: true,
                metricIds: [],
            });
            setSelectedMetrics([]);
        }
    }, [resource, reset, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            {/* Nombre del recurso */}
            <div>
                <label htmlFor="name" className="form-label form-label-required">
                    Nombre del Recurso
                </label>
                <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={errors.name ? 'form-input-error' : 'form-input'}
                    placeholder="Ej: Juan Pérez"
                    disabled={isSubmitting}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            {/* Tipo de Rol */}
            <div>
                <label htmlFor="roleType" className="form-label form-label-required">
                    Tipo de Rol
                </label>
                <select
                    id="roleType"
                    {...register('roleType')}
                    className={errors.roleType ? 'form-select-error' : 'form-select'}
                    disabled={isSubmitting}
                >
                    {ROLE_TYPES.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
                {errors.roleType && <p className="form-error">{errors.roleType.message}</p>}
            </div>

            {/* Estado Activo */}
            <div className="flex items-center space-x-3">
                <input
                    id="isActive"
                    type="checkbox"
                    {...register('isActive')}
                    className="form-checkbox"
                    disabled={isSubmitting}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Recurso activo
                </label>
            </div>

            {/* Métricas Asociadas (Opcional) */}
            <div>
                <label className="form-label form-label-optional">
                    Métricas Asociadas
                </label>

                {/* Métricas seleccionadas */}
                {selectedMetrics.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {selectedMetrics.map((metric) => (
                            <div key={metric.id} className="form-chip">
                                <span>{metric.label}</span>
                                <button
                                    type="button"
                                    onClick={() => removeMetric(metric.id)}
                                    disabled={isSubmitting}
                                    className="form-chip-button"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input de búsqueda con dropdown */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar métricas..."
                        disabled={isSubmitting}
                        className="form-input"
                    />

                    {/* Dropdown de métricas */}
                    {showDropdown && filteredMetrics.length > 0 && (
                        <div className="form-dropdown">
                            {filteredMetrics.map((metric) => (
                                <button
                                    key={metric.id}
                                    type="button"
                                    onClick={() => addMetric(metric)}
                                    disabled={isSubmitting}
                                    className="form-dropdown-item"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">{metric.label}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{metric.key}</div>
                                        </div>
                                        <div className="text-xs text-gray-500">{metric.unit || '-'}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Click outside para cerrar dropdown */}
                {showDropdown && (
                    <div
                        className="form-dropdown-backdrop"
                        onClick={() => setShowDropdown(false)}
                    />
                )}
            </div>

            {/* Botones */}
            {!isSubmitting && (
                <div className="form-actions">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                        {resource ? 'Actualizar Recurso' : 'Crear Recurso'}
                    </button>
                </div>
            )}
        </form>
    );
};
