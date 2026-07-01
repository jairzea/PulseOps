import { UserRole } from './schemas/user.schema';

/**
 * Determina si un usuario es "medible" (aparece como recurso con métricas en el dashboard).
 *
 * Workaround acordado (2026-07-01) para no rehacer el modelo Usuario/Recurso todavía:
 * - `user` es medible por defecto (no requiere guardar nada).
 * - `admin` NO es medible salvo que se marque explícitamente `resourceProfile.isMeasurable`.
 *
 * Así un admin que también produce puede tener métricas sin crearse un usuario-recurso
 * redundante. La unificación completa Usuario/Recurso queda para una spec aparte.
 *
 * ponytail: el flag vive en `resourceProfile` (objeto libre) → sin migración de schema.
 * Ceiling: mezcla permiso con "ser medible" en el mismo doc; upgrade = modelo dedicado.
 */
export function isMeasurableUser(user: {
  role?: UserRole | string;
  resourceProfile?: { isMeasurable?: boolean; [key: string]: unknown } | null;
}): boolean {
  const explicit = user.resourceProfile?.isMeasurable;
  if (typeof explicit === 'boolean') return explicit; // override explícito (ambos roles)
  return user.role === UserRole.USER; // default: los 'user' son medibles
}
