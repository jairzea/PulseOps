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
        <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            {/* Clave */}
            <div>
                <label htmlFor="key" className="form-label form-label-required">
                    Clave
                </label>
                <input
                    {...register('key')}
                    id="key"
                    type="text"
                    placeholder="ej: commits_per_week"
                    className={errors.key ? 'form-input-error' : 'form-input'}
                    disabled={!!initialMetric || loading}
                />
                {errors.key && (
                    <p className="form-error">{errors.key.message}</p>
                )}
                <p className="form-help">
                    Solo letras minúsculas, números y guiones bajos
                </p>
            </div>

            {/* Etiqueta */}
            <div>
                <label htmlFor="label" className="form-label form-label-required">
                    Etiqueta
                </label>
                <input
                    {...register('label')}
                    id="label"
                    type="text"
                    placeholder="ej: Commits por Semana"
                    className={errors.label ? 'form-input-error' : 'form-input'}
                    disabled={loading}
                />
                {errors.label && (
                    <p className="form-error">{errors.label.message}</p>
                )}
            </div>

            {/* Descripción */}
            <div>
                <label htmlFor="description" className="form-label form-label-optional">
                    Descripción
                </label>
                <textarea
                    {...register('description')}
                    id="description"
                    rows={3}
                    placeholder="Describe qué mide esta métrica..."
                    className={errors.description ? 'form-textarea-error' : 'form-textarea'}
                    disabled={loading}
                />
                {errors.description && (
                    <p className="form-error">{errors.description.message}</p>
                )}
            </div>

            {/* Unidad y Tipo de Período */}
            <div className="form-grid-2">
                {/* Unidad */}
                <div>
                    <label htmlFor="unit" className="form-label form-label-optional">
                        Unidad
                    </label>
                    <input
                        {...register('unit')}
                        id="unit"
                        type="text"
                        placeholder="ej: commits, horas"
                        className={errors.unit ? 'form-input-error' : 'form-input'}
                        disabled={loading}
                    />
                    {errors.unit && (
                        <p className="form-error">{errors.unit.message}</p>
                    )}
                </div>

                {/* Tipo de Período */}
                <div>
                    <label htmlFor="periodType" className="form-label form-label-required">
                        Tipo de Período
                    </label>
                    <select
                        {...register('periodType')}
                        id="periodType"
                        className={errors.periodType ? 'form-select-error' : 'form-select'}
                        disabled={loading}
                    >
                        <option value="WEEK">Semanal</option>
                        <option value="MONTH">Mensual</option>
                        <option value="QUARTER">Trimestral</option>
                        <option value="YEAR">Anual</option>
                    </select>
                    {errors.periodType && (
                        <p className="form-error">{errors.periodType.message}</p>
                    )}
                </div>
            </div>

            {/* Asociación de Recursos con Autocompletado */}
            <div>
                <label className="form-label form-label-required">
                    Recursos Asociados
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
                        className="form-input"
                    />

                    {/* Dropdown de autocompletado */}
                    {showDropdown && filteredResources.length > 0 && (
                        <div className="form-dropdown">
                            {filteredResources.map((resource) => (
                                <button
                                    key={resource.id}
                                    type="button"
                                    onClick={() => addResource(resource)}
                                    disabled={loading}
                                    className="form-dropdown-item"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{resource.name}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{resource.roleType}</div>
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
                            <div key={resource.id} className="form-chip">
                                <span>{resource.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeResource(resource.id)}
                                    disabled={loading}
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

                {errors.resourceIds && (
                    <p className="form-error">{errors.resourceIds.message}</p>
                )}
                <p className="form-help">
                    Busca y selecciona los recursos a los que aplica esta métrica
                </p>

                {/* Click outside para cerrar dropdown */}
                {showDropdown && (
                    <div
                        className="form-dropdown-backdrop"
                        onClick={() => setShowDropdown(false)}
                    />
                )}
            </div>

            {/* Botones */}
            {!loading && (
                <div className="form-actions">
                    <LoadingButton
                        type="submit"
                        loading={false}
                        variant="primary"
                    >
                        {initialMetric ? 'Actualizar' : 'Crear'} Métrica
                    </LoadingButton>
                </div>
            )}
        </form>
    );
};
