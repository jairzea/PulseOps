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
  // Opcional: umbrales personalizados que el motor puede aceptar para sobrescribir valores por defecto
  thresholds?: ConditionThresholds;
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
  
  // Señales de análisis de patrones (meta-análisis)
  signals: AnalysisSignal[];
  
  // Metadata
  evaluatedAt: string;
  confidence: number;        // 0-1: confianza en la evaluación (basada en cantidad de datos)
}

// ============================================================================
// META-ANÁLISIS: Detección de patrones peligrosos y volatilidad
// ============================================================================

/**
 * Tipos de señales que pueden detectarse en el análisis histórico
 * Complementan la condición principal con insights adicionales
 */
export type SignalType =
  | 'VOLATILE'           // Serrucho: alternancia frecuente entre subidas y bajadas
  | 'SLOW_DECLINE'       // Deterioro lento: múltiples caídas pequeñas consecutivas
  | 'DATA_GAPS'          // Gaps: faltan períodos esperados en la serie
  | 'RECOVERY_SPIKE'     // Recuperación brusca tras deterioro
  | 'NOISE';             // Ruido: cambios insignificantes sin señal real

/**
 * Señal de análisis que complementa la condición principal
 * Proporciona contexto adicional sobre patrones detectados
 */
export interface AnalysisSignal {
  type: SignalType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  windowUsed: number;          // cuántos puntos analizó el detector
  evidence?: Record<string, number | string>;  // datos que justifican la señal
}

// ============================================================================
// CONFIGURACIÓN: Umbrales y Reglas Personalizables
// ============================================================================

/**
 * Paso de una fórmula de condición
 */
export interface FormulaStep {
  order: number;              // Orden del paso (1, 2, 3...)
  description: string;        // Descripción del paso
  enabled: boolean;           // Si el paso está activo
}

/**
 * Fórmula completa de una condición
 */
export interface ConditionFormula {
  name: string;               // Nombre de la fórmula
  description: string;        // Descripción general
  steps: FormulaStep[];       // Pasos de la fórmula
  enabled: boolean;           // Si la fórmula está activa
}

/**
 * Configuración de umbrales para determinar condiciones operativas
 * Permite ajustar los valores que definen cada condición
 */
export interface ConditionThresholds {
  // AFLUENCIA: Crecimiento pronunciado
  afluencia: {
    minInclination: number;     // Default: +50%
    formula?: ConditionFormula; // Fórmula de acción
  };
  
  // NORMAL: Crecimiento positivo real
  normal: {
    minInclination: number;     // Default: +5%
    maxInclination: number;     // Default: +50%
    formula?: ConditionFormula; // Fórmula de normal
  };
  
  // EMERGENCIA: Estancamiento o descenso leve
  emergencia: {
    minInclination: number;     // Default: -5%
    maxInclination: number;     // Default: +5%
    formula?: ConditionFormula; // Fórmula de emergencia
  };
  
  // PELIGRO: Descenso pronunciado
  peligro: {
    minInclination: number;     // Default: -80%
    maxInclination: number;     // Default: -50%
    formula?: ConditionFormula; // Fórmula de peligro
  };
  
  // PODER: Estado sostenido de excelencia
  poder: {
    minConsecutivePeriods: number;  // Default: 3
    minInclination: number;         // Default: -5% (permite pequeñas variaciones)
    stabilityThreshold: number;     // Default: 0.1 (10% de variación máxima)
    formula?: ConditionFormula;     // Fórmula de poder
  };
  
  // INEXISTENCIA: Valores cercanos a cero
  inexistencia: {
    threshold: number;          // Default: 0.01 (valores < 0.01 se consideran ~0)
    formula?: ConditionFormula; // Fórmula de inexistencia
  };
  
  // Detección de señales
  signals: {
    volatility: {
      minDirectionChanges: number;  // Default: 3
      minWindowSize: number;        // Default: 5
    };
    slowDecline: {
      minConsecutiveDeclines: number;  // Default: 3
      maxInclinationPerPeriod: number; // Default: -5%
    };
    dataGaps: {
      expectedDaysBetweenPoints: number;  // Default: 7 (semanal)
      toleranceDays: number;              // Default: 2
    };
    recoverySpike: {
      minPriorDeclines: number;     // Default: 2
      minRecoveryInclination: number;  // Default: +50%
    };
    noise: {
      maxInclinationVariation: number;  // Default: 5%
      minWindowSize: number;            // Default: 4
    };
  };
}

/**
 * Configuración completa del motor de análisis
 */
export interface AnalysisConfiguration {
  _id?: string;                     // MongoDB ID
  name: string;                     // Nombre descriptivo
  description?: string;             // Descripción de la configuración
  thresholds: ConditionThresholds;  // Umbrales configurables
  isActive: boolean;                // Si está activa (solo una puede estar activa)
  version: number;                  // Versionado de la configuración
  createdAt: string;                // Timestamp de creación
  updatedAt: string;                // Timestamp de última actualización
  createdBy?: string;               // Usuario que creó la configuración
}

/**
 * Tipo de operador para reglas de negocio
 */
export type RuleOperator = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_OR_EQUAL'
  | 'LESS_OR_EQUAL'
  | 'BETWEEN'
  | 'IN'
  | 'NOT_IN';

/**
 * Expresión de una regla de negocio
 * Define una condición lógica que puede evaluarse
 */
export interface RuleExpression {
  field: string;                    // Campo a evaluar (ej: "inclination.value", "condition")
  operator: RuleOperator;           // Operador de comparación
  value: number | string | (number | string)[];  // Valor de comparación
}

/**
 * Acción a ejecutar cuando una regla se cumple
 */
export interface RuleAction {
  type: 'ALERT' | 'NOTIFY' | 'ESCALATE' | 'LOG';
  target?: string;                  // Destinatario (email, webhook, etc.)
  message: string;                  // Mensaje a enviar
  metadata?: Record<string, any>;   // Datos adicionales
}

/**
 * Regla de negocio aplicable a métricas
 * Permite definir lógica personalizada sobre el análisis
 */
export interface BusinessRule {
  _id?: string;                     // MongoDB ID
  name: string;                     // Nombre de la regla
  description: string;              // Descripción detallada
  
  // Alcance
  resourceIds?: string[];           // Recursos específicos (vacío = todos)
  metricIds?: string[];             // Métricas específicas (vacío = todas)
  
  // Lógica
  expressions: RuleExpression[];    // Condiciones (AND entre ellas)
  actions: RuleAction[];            // Acciones a ejecutar
  
  // Control
  isActive: boolean;                // Si la regla está activa
  priority: number;                 // Prioridad (1 = alta, 10 = baja)
  
  // Versionado
  version: number;
  previousVersionId?: string;       // Referencia a versión anterior
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  
  // Estadísticas
  lastTriggered?: string;           // Última vez que se disparó
  triggerCount: number;             // Veces que se ha disparado
}

