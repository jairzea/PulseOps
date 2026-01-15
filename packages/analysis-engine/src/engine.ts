/**
 * Motor de análisis de inclinación y condiciones
 * 
 * Responsabilidades:
 * - Recibe una serie temporal
 * - Calcula la inclinación
 * - Interpreta el comportamiento
 * - Asigna una condición
 * - Devuelve una explicación
 * 
 * NO persiste, NO grafica, NO conoce el origen de los datos.
 * Es puro dominio.
 */

import type {
  AnalysisEngine,
  AnalysisWindowConfig,
  MetricSeries,
  OperationalCondition,
  TrendAnalysisResult,
  TrendDirection,
} from '@pulseops/shared-types';

/**
 * Configuración por defecto de la ventana de análisis
 */
const DEFAULT_WINDOW_SIZE = 2;

/**
 * Determina la dirección de la tendencia basada en el delta
 */
function determineTrendDirection(delta: number): TrendDirection {
  if (delta > 0) return 'UP';
  if (delta < 0) return 'DOWN';
  return 'FLAT';
}

/**
 * Mapea la dirección de tendencia a una condición operativa
 */
function mapToOperationalCondition(
  direction: TrendDirection
): OperationalCondition {
  switch (direction) {
    case 'UP':
      return 'MEJORANDO';
    case 'DOWN':
      return 'DETERIORANDO';
    case 'FLAT':
      return 'ESTABLE';
    case 'INSUFFICIENT_DATA':
      return 'SIN_DATOS';
  }
}

/**
 * Implementación del motor de análisis de inclinación
 */
class TrendAnalysisEngine implements AnalysisEngine {
  /**
   * Analiza una serie temporal y determina su condición operativa
   * 
   * @param series - Serie temporal a analizar
   * @param config - Configuración de ventana (opcional)
   * @returns Resultado del análisis con condición y métricas
   */
  analyze(
    series: MetricSeries,
    config?: AnalysisWindowConfig
  ): TrendAnalysisResult {
    const windowSize = config?.size ?? DEFAULT_WINDOW_SIZE;
    const evaluatedAt = new Date().toISOString();

    // Validación: verificar que hay datos suficientes
    if (!series.points || series.points.length < windowSize) {
      return {
        metricId: series.metricId,
        windowUsed: series.points?.length ?? 0,
        direction: 'INSUFFICIENT_DATA',
        delta: null,
        condition: 'SIN_DATOS',
        evaluatedAt,
      };
    }

    // Extraer los últimos N puntos según el tamaño de ventana
    const relevantPoints = series.points.slice(-windowSize);
    const windowUsed = relevantPoints.length;

    // Obtener el punto anterior y el actual
    const previousPoint = relevantPoints[windowUsed - 2];
    const currentPoint = relevantPoints[windowUsed - 1];

    // Calcular delta
    const delta = currentPoint.value - previousPoint.value;

    // Determinar dirección
    const direction = determineTrendDirection(delta);

    // Mapear a condición operativa
    const condition = mapToOperationalCondition(direction);

    return {
      metricId: series.metricId,
      windowUsed,
      direction,
      delta,
      condition,
      evaluatedAt,
    };
  }
}

/**
 * Exporta una instancia única del motor de análisis
 */
export const analysisEngine: AnalysisEngine = new TrendAnalysisEngine();

/**
 * Exporta la clase para casos de testing o instanciación personalizada
 */
export { TrendAnalysisEngine };
