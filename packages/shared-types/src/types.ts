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

// ============================================================================
// EXTENSIÓN: Condiciones Operativas Avanzadas (Basadas en Fórmulas de Hubbard)
// ============================================================================

/**
 * Condiciones operativas extendidas basadas en las fórmulas de Hubbard
 * Ordenadas jerárquicamente de mayor a menor nivel operativo
 */
export type HubbardCondition =
  | 'PODER'                  // Normal en nivel estelar sostenido
  | 'CAMBIO_DE_PODER'        // Asunción de puesto en Poder
  | 'AFLUENCIA'              // Crecimiento pronunciado
  | 'NORMAL'                 // Crecimiento gradual habitual
  | 'EMERGENCIA'             // Sin cambio o descenso leve
  | 'PELIGRO'                // Caída pronunciada
  | 'INEXISTENCIA'           // Inicio o caída casi vertical
  | 'SIN_DATOS';             // Datos insuficientes

/**
 * Razón que explica por qué se asignó una condición específica
 */
export interface ConditionReason {
  code: string;              // Código único (ej: "STEEP_GROWTH", "NO_CHANGE")
  explanation: string;       // Explicación legible para humanos
  threshold?: number;        // Umbral aplicado (si corresponde)
}

/**
 * Resultado del cálculo de inclinación porcentual
 */
export interface InclinationResult {
  value: number | null;      // Porcentaje de inclinación (null si no calculable)
  previousValue: number;     // E_ant
  currentValue: number;      // E_act
  delta: number;             // ΔE = E_act - E_ant
  isValid: boolean;          // Si el cálculo es válido (E_ant > 0)
}

/**
 * Evaluación completa de condición operativa para una métrica
 * Incluye análisis histórico, inclinación y condición asignada
 */
export interface MetricConditionEvaluation {
  metricId: string;
  
  // Análisis temporal
  windowUsed: number;
  periodType: 'WEEK' | 'MONTH' | 'DAY';  // Tipo de período analizado
  
  // Inclinación
  inclination: InclinationResult;
  
  // Tendencia
  direction: TrendDirection;
  
  // Condición operativa
  condition: HubbardCondition;
  reason: ConditionReason;
  
  // Metadata
  evaluatedAt: string;
  confidence: number;        // 0-1: confianza en la evaluación (basada en cantidad de datos)
}
