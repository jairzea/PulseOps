/**
 * MetricForm - Formulario de métricas con React Hook Form
 */
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { metricFormSchema, MetricFormData } from '../schemas/metricFormSchema';
import { Resource, Metric } from '../services/apiClient';
import { LoadingButton } from './LoadingButton';

interface MetricFormProps {
    onSubmit: (data: MetricFormData) => void;
    initialMetric?: Metric | null;
    resources: Resource[];
    loading?: boolean;
}

export const MetricForm: React.FC<MetricFormProps> = ({
    onSubmit,
    initialMetric,
    resources,
    loading = false,
}) => {
    const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<MetricFormData>({
        resolver: yupResolver(metricFormSchema) as any,
        defaultValues: {
            key: initialMetric?.key || '',
            label: initialMetric?.label || '',
            description: initialMetric?.description || '',
            unit: initialMetric?.unit || '',
            periodType: (initialMetric?.periodType as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR') || 'WEEK',
            resourceIds: [], // TODO: Obtener desde backend cuando haya soporte
        },
    });

    // Filtrar recursos según búsqueda
    const filteredResources = resources.filter(
        (resource) =>
            !selectedResources.find((sr) => sr.id === resource.id) &&
            (resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.roleType.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Agregar recurso seleccionado
    const addResource = (resource: Resource) => {
        const newSelected = [...selectedResources, resource];
        setSelectedResources(newSelected);
        setValue(
            'resourceIds',
            newSelected.map((r) => r.id)
        );
        setSearchTerm('');
        setShowDropdown(false);
    };

    // Remover recurso seleccionado
    const removeResource = (resourceId: string) => {
        const newSelected = selectedResources.filter((r) => r.id !== resourceId);
        setSelectedResources(newSelected);
        setValue(
            'resourceIds',
            newSelected.map((r) => r.id)
        );
    };

    // Resetear el formulario cuando cambie el registro inicial
    useEffect(() => {
        if (initialMetric) {
            // Cargar recursos asociados desde la métrica
            const associatedResources = resources.filter((r) =>
                initialMetric.resourceIds?.includes(r.id)
            );

            reset({
                key: initialMetric.key,
                label: initialMetric.label,
                description: initialMetric.description || '',
                unit: initialMetric.unit || '',
                periodType: (initialMetric.periodType as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR') || 'WEEK',
                resourceIds: initialMetric.resourceIds || [],
            });
            setSelectedResources(associatedResources);
        } else {
            reset({
                key: '',
                label: '',
                description: '',
                unit: '',
                periodType: 'WEEK',
                resourceIds: [],
            });
            setSelectedResources([]);
        }
    }, [initialMetric, reset, resources]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Clave */}
            <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-2">
                    Clave <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('key')}
                    id="key"
                    type="text"
                    placeholder="ej: commits_per_week"
                    className={`w-full px-4 py-2 bg-gray-800 border ${
                        errors.key ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    disabled={!!initialMetric || loading}
                />
                {errors.key && (
                    <p className="mt-1 text-sm text-red-500">{errors.key.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                    Solo letras minúsculas, números y guiones bajos
                </p>
            </div>

            {/* Etiqueta */}
            <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-2">
                    Etiqueta <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('label')}
                    id="label"
                    type="text"
                    placeholder="ej: Commits por Semana"
                    className={`w-full px-4 py-2 bg-gray-800 border ${
                        errors.label ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    disabled={loading}
                />
                {errors.label && (
                    <p className="mt-1 text-sm text-red-500">{errors.label.message}</p>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción <span className="text-gray-500">(Opcional)</span>
                </label>
                <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    placeholder="Describe qué mide esta métrica..."
                    className={`w-full px-4 py-2 bg-gray-800 border ${
                        errors.description ? 'border-red-500' : 'border-gray-700'
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    disabled={loading}
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            {/* Unidad y Tipo de Período */}
            <div className="grid grid-cols-2 gap-4">
                {/* Unidad */}
                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-2">
                        Unidad <span className="text-gray-500">(Opcional)</span>
                    </label>
                    <input
                        {...register('unit')}
                        id="unit"
                        type="text"
                        placeholder="ej: commits, horas"
                        className={`w-full px-4 py-2 bg-gray-800 border ${
                            errors.unit ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        disabled={loading}
                    />
                    {errors.unit && (
                        <p className="mt-1 text-sm text-red-500">{errors.unit.message}</p>
                    )}
                </div>

                {/* Tipo de Período */}
                <div>
                    <label htmlFor="periodType" className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de Período <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('periodType')}
                        id="periodType"
                        className={`w-full px-4 py-2 bg-gray-800 border ${
                            errors.periodType ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        disabled={loading}
                    >
                        <option value="WEEK">Semanal</option>
                        <option value="MONTH">Mensual</option>
                        <option value="QUARTER">Trimestral</option>
                        <option value="YEAR">Anual</option>
                    </select>
                    {errors.periodType && (
                        <p className="mt-1 text-sm text-red-500">{errors.periodType.message}</p>
                    )}
                </div>
            </div>

            {/* Asociación de Recursos con Autocompletado */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recursos Asociados <span className="text-red-500">*</span>
                </label>

                {/* Input de búsqueda */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Buscar recursos..."
                        disabled={loading}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    />

                    {/* Dropdown de autocompletado */}
                    {showDropdown && filteredResources.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredResources.map((resource) => (
                                <button
                                    key={resource.id}
                                    type="button"
                                    onClick={() => addResource(resource)}
                                    disabled={loading}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors disabled:opacity-50 border-b border-gray-700 last:border-b-0"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">{resource.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{resource.roleType}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recursos seleccionados como chips */}
                {selectedResources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {selectedResources.map((resource) => (
                            <div
                                key={resource.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm text-blue-300"
                            >
                                <span>{resource.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeResource(resource.id)}
                                    disabled={loading}
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

                {errors.resourceIds && (
                    <p className="mt-1 text-sm text-red-500">{errors.resourceIds.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                    Busca y selecciona los recursos a los que aplica esta métrica
                </p>

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
                <LoadingButton
                    type="submit"
                    loading={loading}
                    variant="primary"
                >
                    {initialMetric ? 'Actualizar' : 'Crear'} Métrica
                </LoadingButton>
            </div>
        </form>
    );
};
