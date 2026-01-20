/**
 * Resource Form Schema - Validación Zod para formularios de recursos
 */
import { z } from 'zod';

export const resourceFormSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),

    roleType: z.enum(['DEV', 'TL', 'OTHER'] as const),

    isActive: z.boolean().default(true),

    metricIds: z.array(z.string()).optional(),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;
