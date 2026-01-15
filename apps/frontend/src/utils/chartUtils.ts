import { MetricPoint } from '@pulseops/shared-types';

/**
 * Calcula la regresión lineal usando el método de mínimos cuadrados.
 * Retorna pendiente (m) e intersección (b) para la ecuación y = mx + b
 */
export function calculateLinearRegression(points: MetricPoint[]): {
  slope: number;
  intercept: number;
} {
  const n = points.length;
  
  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }

  // Asignar índices numéricos a los puntos (0, 1, 2, ...)
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  points.forEach((point, index) => {
    const x = index;
    const y = point.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  // Fórmulas de mínimos cuadrados
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Construye los datos para el gráfico combinando valores reales con tendencia calculada
 */
export interface ChartDataPoint {
  week: string;
  timestamp: string;
  value: number;
  trend: number;
}

export function buildChartData(points: MetricPoint[]): ChartDataPoint[] {
  const { slope, intercept } = calculateLinearRegression(points);

  return points.map((point, index) => {
    const trendValue = slope * index + intercept;
    
    // Formato de semana legible
    const weekLabel = `S${index + 1}`;
    
    return {
      week: weekLabel,
      timestamp: point.timestamp,
      value: point.value,
      trend: Number(trendValue.toFixed(2)),
    };
  });
}
