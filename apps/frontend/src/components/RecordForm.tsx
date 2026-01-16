/**
 * RecordForm - Formulario para crear/editar registros manuales
 */
import React, { useState, useEffect } from 'react';
import { Resource, Metric, Record as MetricRecord } from '../services/apiClient';

interface RecordFormProps {
  resources: Resource[];
  metrics: Metric[];
  initialRecord?: MetricRecord | null;
  onSubmit: (data: RecordFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface RecordFormData {
  resourceId: string;
  metricKey: string;
  week: string;
  timestamp: string;
  value: number;
  source?: string;
}

// Generar formato de semana ISO (YYYY-Www)
const getCurrentWeek = (): string => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.ceil(diff / oneWeek);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

export const RecordForm: React.FC<RecordFormProps> = ({
  resources,
  metrics,
  initialRecord,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<RecordFormData>({
    resourceId: initialRecord?.resourceId || '',
    metricKey: initialRecord?.metricKey || '',
    week: initialRecord?.week || getCurrentWeek(),
    timestamp: initialRecord?.timestamp || new Date().toISOString(),
    value: initialRecord?.value || 0,
    source: initialRecord?.source || 'MANUAL',
  });

  type FormErrors = {
    [K in keyof RecordFormData]?: string;
  };

  const [errors, setErrors] = useState<FormErrors>({});

  // Si cambia initialRecord, actualizar formulario
  useEffect(() => {
    if (initialRecord) {
      setFormData({
        resourceId: initialRecord.resourceId,
        metricKey: initialRecord.metricKey,
        week: initialRecord.week,
        timestamp: initialRecord.timestamp,
        value: initialRecord.value,
        source: initialRecord.source || 'MANUAL',
      });
    }
  }, [initialRecord]);

  const handleChange = (field: keyof RecordFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error al editar
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.resourceId) {
      newErrors.resourceId = 'Debes seleccionar un recurso';
    }
    if (!formData.metricKey) {
      newErrors.metricKey = 'Debes seleccionar una métrica';
    }
    if (!formData.week) {
      newErrors.week = 'Debes especificar una semana';
    }
    if (formData.value === null || formData.value === undefined || isNaN(Number(formData.value))) {
      newErrors.value = 'Debes especificar un valor numérico válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recurso */}
      <div>
        <label htmlFor="resourceId" className="block text-sm font-medium text-gray-300 mb-2">
          Recurso *
        </label>
        <select
          id="resourceId"
          value={formData.resourceId}
          onChange={(e) => handleChange('resourceId', e.target.value)}
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
          <p className="mt-1 text-sm text-red-500">{errors.resourceId}</p>
        )}
      </div>

      {/* Métrica */}
      <div>
        <label htmlFor="metricKey" className="block text-sm font-medium text-gray-300 mb-2">
          Métrica *
        </label>
        <select
          id="metricKey"
          value={formData.metricKey}
          onChange={(e) => handleChange('metricKey', e.target.value)}
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
          <p className="mt-1 text-sm text-red-500">{errors.metricKey}</p>
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
          value={formData.week}
          onChange={(e) => handleChange('week', e.target.value)}
          disabled={isSubmitting}
          placeholder="2026-W02"
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.week ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.week && (
          <p className="mt-1 text-sm text-red-500">{errors.week}</p>
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
          value={formData.value}
          onChange={(e) => handleChange('value', Number(e.target.value))}
          disabled={isSubmitting}
          step="any"
          className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.value ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.value && (
          <p className="mt-1 text-sm text-red-500">{errors.value}</p>
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
          value={formData.source || ''}
          onChange={(e) => handleChange('source', e.target.value)}
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
