/**
 * Tipos de dominio compartidos
 */

/**
 * Punto individual en una serie temporal de métrica
 */
export interface MetricPoint {
  timestamp: string;  // ISO date (ej: inicio de semana)
  value: number;      // valor de la métrica
}

/**
 * Serie temporal completa de una métrica
 */
export interface MetricSeries {
  metricId: string;         // ej: "velocity", "bugs", "coverage"
  points: MetricPoint[];    // ordenados ascendentemente por tiempo
}

/**
 * Configuración de la ventana de análisis
 */
export interface AnalysisWindowConfig {
  size: number;  // número de períodos a analizar (default: 2)
}

/**
 * Dirección de la tendencia detectada
 */
export type TrendDirection =
  | 'UP'
  | 'DOWN'
  | 'FLAT'
  | 'INSUFFICIENT_DATA';

/**
 * Condición operativa resultante del análisis
 */
export type OperationalCondition =
  | 'MEJORANDO'
  | 'ESTABLE'
  | 'DETERIORANDO'
  | 'SIN_DATOS';

/**
 * Resultado del análisis de tendencia
 */
export interface TrendAnalysisResult {
  metricId: string;
  
  windowUsed: number;               // períodos realmente analizados
  direction: TrendDirection;
  
  delta: number | null;             // diferencia entre último y anterior
  condition: OperationalCondition;
  
  evaluatedAt: string;              // timestamp de evaluación
}

/**
 * Interfaz del motor de análisis
 */
export interface AnalysisEngine {
  analyze(
    series: MetricSeries,
    config?: AnalysisWindowConfig
  ): TrendAnalysisResult;
}
