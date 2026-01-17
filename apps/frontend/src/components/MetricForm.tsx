/**
 * MetricForm - Formulario de métricas con React Hook Form
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { metricFormSchema, MetricFormData } from '../schemas/metricFormSchema';
import { Resource, Metric } from '../services/apiClient';

interface MetricFormProps {
  onSubmit: (data: MetricFormData) => void;
  initialMetric?: Metric | null;
  resources: Resource[];
}

export const MetricForm: React.FC<MetricFormProps> = ({
  onSubmit,
  initialMetric,
  resources,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  // Resetear el formulario cuando cambie el registro inicial
  useEffect(() => {
    if (initialMetric) {
      reset({
        key: initialMetric.key,
        label: initialMetric.label,
        description: initialMetric.description || '',
        unit: initialMetric.unit || '',
        periodType: (initialMetric.periodType as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR') || 'WEEK',
        resourceIds: [], // TODO: Obtener desde backend
      });
    } else {
      reset({
        key: '',
        label: '',
        description: '',
        unit: '',
        periodType: 'WEEK',
        resourceIds: [],
      });
    }
  }, [initialMetric, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Clave */}
      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
          Clave <span className="text-red-500">*</span>
        </label>
        <input
          {...register('key')}
          id="key"
          type="text"
          placeholder="ej: commits_per_week"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!!initialMetric} // La clave no se puede editar
        />
        {errors.key && (
          <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Solo letras minúsculas, números y guiones bajos
        </p>
      </div>

      {/* Etiqueta */}
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
          Etiqueta <span className="text-red-500">*</span>
        </label>
        <input
          {...register('label')}
          id="label"
          type="text"
          placeholder="ej: Commits por Semana"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.label && (
          <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          placeholder="Describe qué mide esta métrica..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Unidad y Tipo de Período */}
      <div className="grid grid-cols-2 gap-4">
        {/* Unidad */}
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unidad
          </label>
          <input
            {...register('unit')}
            id="unit"
            type="text"
            placeholder="ej: commits, horas"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>

        {/* Tipo de Período */}
        <div>
          <label htmlFor="periodType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Período
          </label>
          <select
            {...register('periodType')}
            id="periodType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="WEEK">Semanal</option>
            <option value="MONTH">Mensual</option>
            <option value="QUARTER">Trimestral</option>
            <option value="YEAR">Anual</option>
          </select>
          {errors.periodType && (
            <p className="mt-1 text-sm text-red-600">{errors.periodType.message}</p>
          )}
        </div>
      </div>

      {/* Asociación de Recursos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recursos Asociados <span className="text-red-500">*</span>
        </label>
        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
          {resources.length === 0 ? (
            <p className="text-sm text-gray-500">No hay recursos disponibles</p>
          ) : (
            resources.map((resource) => (
              <label
                key={resource.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  {...register('resourceIds')}
                  type="checkbox"
                  value={resource.id}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  {resource.name}
                  <span className="text-xs text-gray-500 ml-2">({resource.roleType})</span>
                </span>
              </label>
            ))
          )}
        </div>
        {errors.resourceIds && (
          <p className="mt-1 text-sm text-red-600">{errors.resourceIds.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Selecciona los recursos a los que aplica esta métrica
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {initialMetric ? 'Actualizar' : 'Crear'} Métrica
        </button>
      </div>
    </form>
  );
};
