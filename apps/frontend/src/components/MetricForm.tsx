/**
 * MetricForm - Formulario de métricas con React Hook Form
 */
import React, { useEffect, useState } from 'react';
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
      reset({
        key: initialMetric.key,
        label: initialMetric.label,
        description: initialMetric.description || '',
        unit: initialMetric.unit || '',
        periodType: (initialMetric.periodType as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR') || 'WEEK',
        resourceIds: [], // TODO: Obtener desde backend
      });
      setSelectedResources([]);
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
  }, [initialMetric, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Clave */}
      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-900 mb-1">
          Clave <span className="text-red-500">*</span>
        </label>
        <input
          {...register('key')}
          id="key"
          type="text"
          placeholder="ej: commits_per_week"
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
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
        <label htmlFor="label" className="block text-sm font-medium text-gray-900 mb-1">
          Etiqueta <span className="text-red-500">*</span>
        </label>
        <input
          {...register('label')}
          id="label"
          type="text"
          placeholder="ej: Commits por Semana"
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
        {errors.label && (
          <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
          Descripción
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          placeholder="Describe qué mide esta métrica..."
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Unidad y Tipo de Período */}
      <div className="grid grid-cols-2 gap-4">
        {/* Unidad */}
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-900 mb-1">
            Unidad
          </label>
          <input
            {...register('unit')}
            id="unit"
            type="text"
            placeholder="ej: commits, horas"
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          />
          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>

        {/* Tipo de Período */}
        <div>
          <label htmlFor="periodType" className="block text-sm font-medium text-gray-900 mb-1">
            Tipo de Período
          </label>
          <select
            {...register('periodType')}
            id="periodType"
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Asociación de Recursos con Autocompletado */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
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
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          />

          {/* Dropdown de autocompletado */}
          {showDropdown && filteredResources.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredResources.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => addResource(resource)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <span className="text-sm text-gray-900 font-medium">{resource.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({resource.roleType})</span>
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span className="font-medium">{resource.name}</span>
                <span className="text-xs text-blue-600">({resource.roleType})</span>
                <button
                  type="button"
                  onClick={() => removeResource(resource.id)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 focus:outline-none"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
          <p className="mt-1 text-sm text-red-600">{errors.resourceIds.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Busca y selecciona los recursos a los que aplica esta métrica
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
