/**
 * ResourceForm - Formulario reutilizable para crear/editar recursos
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, ResourceFormData } from '../schemas/resourceFormSchema';
import { Resource } from '../services/apiClient';
import { Metric } from '../services/apiClient';

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
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ResourceFormData>({
        resolver: zodResolver(resourceFormSchema),
        defaultValues: {
            name: resource?.name || '',
            roleType: resource?.roleType || 'DEV',
            isActive: resource?.isActive ?? true,
            metricIds: [],
        },
    });

    // Reset form when resource changes
    useEffect(() => {
        if (resource) {
            reset({
                name: resource.name,
                roleType: resource.roleType,
                isActive: resource.isActive,
                metricIds: [],
            });
        } else {
            reset({
                name: '',
                roleType: 'DEV',
                isActive: true,
                metricIds: [],
            });
        }
    }, [resource, reset]);

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

            {/* Métricas Asociadas (Opcional - para futuras mejoras) */}
            {metrics.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Métricas Asociadas <span className="text-gray-500">(Opcional)</span>
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                        {metrics.map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-2">
                                <input
                                    id={`metric-${metric.id}`}
                                    type="checkbox"
                                    value={metric.id}
                                    {...register('metricIds')}
                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor={`metric-${metric.id}`} className="text-sm text-gray-300">
                                    {metric.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
