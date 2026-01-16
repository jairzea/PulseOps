/**
 * RecordForm - Formulario con React Hook Form + Yup
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Resource, Metric, Record as MetricRecord } from '../services/apiClient';
import { RecordFormData, recordFormSchema, getCurrentWeek } from '../schemas/recordFormSchema';

interface RecordFormProps {
  resources: Resource[];
  metrics: Metric[];
  initialRecord?: MetricRecord | null;
  onSubmit: (data: RecordFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  resources,
  metrics,
  initialRecord,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecordFormData>({
    resolver: yupResolver(recordFormSchema) as any,
    defaultValues: {
      resourceId: initialRecord?.resourceId || '',
      metricKey: initialRecord?.metricKey || '',
      week: initialRecord?.week || getCurrentWeek(),
      timestamp: initialRecord?.timestamp || new Date().toISOString(),
      value: initialRecord?.value || 0,
      source: initialRecord?.source || 'MANUAL',
    },
  });

  // Reset form cuando cambia initialRecord
  useEffect(() => {
    if (initialRecord) {
      reset({
        resourceId: initialRecord.resourceId,
        metricKey: initialRecord.metricKey,
        week: initialRecord.week,
        timestamp: initialRecord.timestamp,
        value: initialRecord.value,
        source: initialRecord.source || 'MANUAL',
      });
    }
  }, [initialRecord, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Recurso */}
      <div>
        <label htmlFor="resourceId" className="block text-sm font-medium text-gray-300 mb-2">
          Recurso *
        </label>
        <select
          id="resourceId"
          {...register('resourceId')}
          disabled={isSubmitting || !!initialRecord}
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.resourceId ? 'border-red-500' : 'border-gray-700'
          } ${initialRecord ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">Seleccionar recurso...</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name} ({resource.roleType})
            </option>
          ))}
        </select>
        {errors.resourceId && (
          <p className="mt-1 text-sm text-red-500">{errors.resourceId.message}</p>
        )}
      </div>

      {/* Métrica */}
      <div>
        <label htmlFor="metricKey" className="block text-sm font-medium text-gray-300 mb-2">
          Métrica *
        </label>
        <select
          id="metricKey"
          {...register('metricKey')}
          disabled={isSubmitting || !!initialRecord}
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.metricKey ? 'border-red-500' : 'border-gray-700'
          } ${initialRecord ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">Seleccionar métrica...</option>
          {metrics.map((metric) => (
            <option key={metric.id} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </select>
        {errors.metricKey && (
          <p className="mt-1 text-sm text-red-500">{errors.metricKey.message}</p>
        )}
      </div>

      {/* Semana */}
      <div>
        <label htmlFor="week" className="block text-sm font-medium text-gray-300 mb-2">
          Semana (YYYY-Www) *
        </label>
        <input
          type="text"
          id="week"
          {...register('week')}
          disabled={isSubmitting}
          placeholder="2026-W02"
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.week ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.week && (
          <p className="mt-1 text-sm text-red-500">{errors.week.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Formato: YYYY-Www (ej: 2026-W02)</p>
      </div>

      {/* Valor */}
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-2">
          Valor *
        </label>
        <input
          type="number"
          id="value"
          {...register('value', { valueAsNumber: true })}
          disabled={isSubmitting}
          step="any"
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.value ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.value && (
          <p className="mt-1 text-sm text-red-500">{errors.value.message}</p>
        )}
      </div>

      {/* Source (opcional) */}
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-2">
          Fuente (opcional)
        </label>
        <input
          type="text"
          id="source"
          {...register('source')}
          disabled={isSubmitting}
          placeholder="MANUAL"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : initialRecord ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};
