/**
 * Metric Form Schema - Validaciones con Yup
 */
import * as yup from 'yup';

export const metricFormSchema = yup.object({
  key: yup
    .string()
    .required('La clave es obligatoria')
    .matches(
      /^[a-z0-9_]+$/,
      'La clave solo puede contener letras minúsculas, números y guiones bajos'
    )
    .min(2, 'La clave debe tener al menos 2 caracteres')
    .max(50, 'La clave no puede exceder 50 caracteres'),
  
  label: yup
    .string()
    .required('La etiqueta es obligatoria')
    .min(2, 'La etiqueta debe tener al menos 2 caracteres')
    .max(100, 'La etiqueta no puede exceder 100 caracteres'),
  
  description: yup
    .string()
    .optional()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  unit: yup
    .string()
    .optional()
    .max(20, 'La unidad no puede exceder 20 caracteres'),
  
  periodType: yup
    .string()
    .optional()
    .oneOf(['WEEK', 'MONTH', 'QUARTER', 'YEAR'], 'Tipo de período inválido'),
  
  resourceIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Debes seleccionar al menos un recurso')
    .required('Los recursos son obligatorios'),
});

// Definir la interfaz manualmente para evitar problemas con InferType de Yup
export interface MetricFormData {
  key: string;
  label: string;
  description?: string;
  unit?: string;
  periodType?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  resourceIds: string[];
}
