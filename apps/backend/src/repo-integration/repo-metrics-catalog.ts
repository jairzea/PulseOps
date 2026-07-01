/**
 * Catálogo de las métricas derivadas de repositorios (fuente única de verdad de sus keys,
 * labels y categoría POR DEFECTO). El autoprovisionamiento las siembra en la colección
 * `metrics` para que no queden huérfanas, pero la categoría real (producción/estudio/
 * seguimiento) la decide el ADMIN en la sesión de métricas — el provisioning nunca pisa una
 * métrica ya existente.
 *
 * `defaultCategory` es solo el valor inicial al crearla; `principal` marca las candidatas
 * naturales a producción (para las sugerencias por rol en el frontend).
 */
export type MetricCategory = 'PRODUCTION' | 'STUDY' | 'TRACKING';

export interface RepoMetricDef {
  key: string;
  label: string;
  description: string;
  unit: string;
  defaultCategory: MetricCategory;
  principal: boolean; // candidata a producción (para sugerencias)
  roles: Array<'DEV' | 'QA'>; // a qué familia de rol aplica
}

/** Métricas de desarrollador/arquitecto. */
export const DEV_REPO_METRICS: RepoMetricDef[] = [
  {
    key: 'nui',
    label: 'Inserciones Útiles Netas (NUI)',
    description: 'Líneas insertadas menos self-churn (código que sobrevive).',
    unit: 'líneas',
    defaultCategory: 'TRACKING',
    principal: true,
    roles: ['DEV'],
  },
  {
    key: 'dev_efficiency',
    label: 'Eficiencia de desarrollo',
    description: 'Delta neto sobre inserciones brutas (%). Qué tanto del trabajo permanece.',
    unit: '%',
    defaultCategory: 'TRACKING',
    principal: true,
    roles: ['DEV'],
  },
  {
    key: 'uip_per_day',
    label: 'UIP por día',
    description: 'Inserciones útiles netas por día trabajado.',
    unit: 'líneas/día',
    defaultCategory: 'TRACKING',
    principal: false,
    roles: ['DEV'],
  },
  {
    key: 'self_churn_rate',
    label: 'Tasa de self-churn',
    description: 'Porcentaje de las inserciones propias que la misma persona reescribió.',
    unit: '%',
    defaultCategory: 'TRACKING',
    principal: false,
    roles: ['DEV'],
  },
  {
    key: 'fix_ratio_freq',
    label: 'Fix ratio (frecuencia)',
    description: 'Porcentaje de commits correctivos sobre el total.',
    unit: '%',
    defaultCategory: 'TRACKING',
    principal: false,
    roles: ['DEV'],
  },
  {
    key: 'fix_ratio_vol',
    label: 'Fix ratio (volumen)',
    description: 'Porcentaje de inserciones correctivas sobre el total.',
    unit: '%',
    defaultCategory: 'TRACKING',
    principal: false,
    roles: ['DEV'],
  },
  {
    key: 'commits_per_day',
    label: 'Commits por día',
    description: 'Commits por día trabajado.',
    unit: 'commits/día',
    defaultCategory: 'TRACKING',
    principal: false,
    roles: ['DEV'],
  },
  {
    key: 'working_days',
    label: 'Días trabajados',
    description: 'Días calendario con al menos un commit en la semana.',
    unit: 'días',
    defaultCategory: 'TRACKING',
    principal: false,
    roles: ['DEV'],
  },
];

/** Métricas de QA. */
export const QA_REPO_METRICS: RepoMetricDef[] = [
  {
    key: 'validated_acs',
    label: 'Criterios de aceptación validados',
    description: 'Suma de "N/N ACs pass" de los merges de la semana.',
    unit: 'criterios',
    defaultCategory: 'TRACKING',
    principal: true,
    roles: ['QA'],
  },
];

export const ALL_REPO_METRICS: RepoMetricDef[] = [...DEV_REPO_METRICS, ...QA_REPO_METRICS];

/** Devuelve las definiciones que aplican a un rol (QA vs dev/arquitecto/otros). */
export function metricsForRole(resourceType?: string): RepoMetricDef[] {
  return resourceType === 'QA' ? QA_REPO_METRICS : DEV_REPO_METRICS;
}
