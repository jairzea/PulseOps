/**
 * ResourceForm - Formulario reutilizable para crear/editar recursos
 */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, ResourceFormData } from '../schemas/resourceFormSchema';
import { Resource, Metric } from '../services/apiClient';

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
            // TODO: Cargar métricas asociadas cuando el backend lo soporte
            const associatedMetrics: Metric[] = [];

            reset({
                name: resource.name,
                roleType: resource.roleType,
                isActive: resource.isActive,
                metricIds: [],
            });
            setSelectedMetrics(associatedMetrics);
        } else {
            reset({
                name: '',
                roleType: 'DEV',
                isActive: true,
                metricIds: [],
            });
            setSelectedMetrics([]);
        }
    }, [resource, reset, metrics]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre del recurso */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Recurso <span className="text-red-500">*</span>
                </label>
                <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className={`w-full px-4 py-2 bg-gray-800 border ${
                        errors.name ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Ej: Juan Pérez"
                    disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Tipo de Rol */}
            <div>
                <label htmlFor="roleType" className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Rol <span className="text-red-500">*</span>
                </label>
                <select
                    id="roleType"
                    {...register('roleType')}
                    className={`w-full px-4 py-2 bg-gray-800 border ${
                        errors.roleType ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    disabled={isSubmitting}
                >
                    {ROLE_TYPES.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
                {errors.roleType && <p className="mt-1 text-sm text-red-500">{errors.roleType.message}</p>}
            </div>

            {/* Estado Activo */}
            <div className="flex items-center space-x-3">
                <input
                    id="isActive"
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isSubmitting}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                    Recurso activo
                </label>
            </div>

            {/* Métricas Asociadas (Opcional) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Métricas Asociadas <span className="text-gray-500">(Opcional)</span>
                </label>

                {/* Métricas seleccionadas */}
                {selectedMetrics.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {selectedMetrics.map((metric) => (
                            <div
                                key={metric.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm text-blue-300"
                            >
                                <span>{metric.label}</span>
                                <button
                                    type="button"
                                    onClick={() => removeMetric(metric.id)}
                                    disabled={isSubmitting}
                                    className="hover:text-blue-100 transition-colors disabled:opacity-50"
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
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    />

                    {/* Dropdown de métricas */}
                    {showDropdown && filteredMetrics.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredMetrics.map((metric) => (
                                <button
                                    key={metric.id}
                                    type="button"
                                    onClick={() => addMetric(metric)}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors disabled:opacity-50 border-b border-gray-700 last:border-b-0"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">{metric.label}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{metric.key}</div>
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
                        className="fixed inset-0 z-0"
                        onClick={() => setShowDropdown(false)}
                    />
                )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Guardando...
                        </>
                    ) : resource ? (
                        'Actualizar Recurso'
                    ) : (
                        'Crear Recurso'
                    )}
                </button>
            </div>
        </form>
    );
};
