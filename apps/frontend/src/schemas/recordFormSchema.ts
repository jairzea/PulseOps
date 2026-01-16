/**
 * Record Form Schema - Validaciones con Yup
 */
import * as yup from 'yup';

// Generar formato de semana ISO (YYYY-Www)
export const getCurrentWeek = (): string => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - startOfYear.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.ceil(diff / oneWeek);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

export const recordFormSchema = yup.object({
  resourceId: yup
    .string()
    .required('Debes seleccionar un recurso'),
  
  metricKey: yup
    .string()
    .required('Debes seleccionar una métrica'),
  
  week: yup
    .string()
    .required('Debes especificar una semana')
    .matches(
      /^\d{4}-W\d{2}$/,
      'Formato inválido. Debe ser YYYY-Www (ej: 2026-W02)'
    ),
  
  timestamp: yup
    .string()
    .required('Timestamp es requerido'),
  
  value: yup
    .number()
    .typeError('Debes especificar un valor numérico válido')
    .required('El valor es requerido'),
  
  source: yup
    .string()
    .optional(),
});

// Definir la interfaz manualmente para evitar problemas con InferType de Yup
export interface RecordFormData {
  resourceId: string;
  metricKey: string;
  week: string;
  timestamp: string;
  value: number;
  source?: string;
}
