/**
 * Datos mock para demo live de PulseOps
 * 
 * Representa series temporales semanales para diferentes métricas
 * En producción, estos datos vendrán del backend
 */

import type { MetricSeries } from '@pulseops/shared-types';

/**
 * Genera fechas ISO para las últimas N semanas
 */
function generateWeeklyTimestamps(weeks: number): string[] {
  const timestamps: string[] = [];
  const now = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7));
    timestamps.push(date.toISOString());
  }
  
  return timestamps;
}

/**
 * Serie 1: Story Points completados (Desarrollador)
 * Patrón: Deterioro lento persistente (SLOW_DECLINE)
 */
export const storyPointsSeries: MetricSeries = {
  metricId: 'story_points',
  points: [
    { timestamp: generateWeeklyTimestamps(8)[0], value: 100 },
    { timestamp: generateWeeklyTimestamps(8)[1], value: 95 },
    { timestamp: generateWeeklyTimestamps(8)[2], value: 91 },
    { timestamp: generateWeeklyTimestamps(8)[3], value: 87 },
    { timestamp: generateWeeklyTimestamps(8)[4], value: 83 },
    { timestamp: generateWeeklyTimestamps(8)[5], value: 80 },
    { timestamp: generateWeeklyTimestamps(8)[6], value: 78 },
    { timestamp: generateWeeklyTimestamps(8)[7], value: 76 },
  ],
};

/**
 * Serie 2: Integraciones exitosas (Líder Técnico)
 * Patrón: Volatilidad (VOLATILE)
 */
export const integrationsSeries: MetricSeries = {
  metricId: 'integrations',
  points: [
    { timestamp: generateWeeklyTimestamps(7)[0], value: 10 },
    { timestamp: generateWeeklyTimestamps(7)[1], value: 25 },
    { timestamp: generateWeeklyTimestamps(7)[2], value: 12 },
    { timestamp: generateWeeklyTimestamps(7)[3], value: 28 },
    { timestamp: generateWeeklyTimestamps(7)[4], value: 15 },
    { timestamp: generateWeeklyTimestamps(7)[5], value: 30 },
    { timestamp: generateWeeklyTimestamps(7)[6], value: 18 },
  ],
};

/**
 * Serie 3: Performance Score (Desarrollador)
 * Patrón: Recuperación brusca tras caídas (RECOVERY_SPIKE)
 */
export const performanceSeries: MetricSeries = {
  metricId: 'performance',
  points: [
    { timestamp: generateWeeklyTimestamps(6)[0], value: 85 },
    { timestamp: generateWeeklyTimestamps(6)[1], value: 80 },
    { timestamp: generateWeeklyTimestamps(6)[2], value: 72 },
    { timestamp: generateWeeklyTimestamps(6)[3], value: 65 },
    { timestamp: generateWeeklyTimestamps(6)[4], value: 60 },
    { timestamp: generateWeeklyTimestamps(6)[5], value: 110 }, // Spike de recuperación
  ],
};

/**
 * Catálogo de métricas disponibles para demo
 */
export const DEMO_METRICS = [
  {
    id: 'story_points',
    name: 'Story Points Completados',
    description: 'Puntos de historia completados por semana',
    owner: 'Desarrollador',
    series: storyPointsSeries,
  },
  {
    id: 'integrations',
    name: 'Integraciones Exitosas',
    description: 'Cantidad de integraciones exitosas a producción',
    owner: 'Líder Técnico',
    series: integrationsSeries,
  },
  {
    id: 'performance',
    name: 'Performance Score',
    description: 'Puntuación de rendimiento del equipo',
    owner: 'Desarrollador',
    series: performanceSeries,
  },
] as const;

/**
 * Obtiene una serie por su ID
 */
export function getSeriesById(metricId: string): MetricSeries | undefined {
  return DEMO_METRICS.find(m => m.id === metricId)?.series;
}

/**
 * Obtiene metadata de una métrica por ID
 */
export function getMetricInfo(metricId: string) {
  return DEMO_METRICS.find(m => m.id === metricId);
}
