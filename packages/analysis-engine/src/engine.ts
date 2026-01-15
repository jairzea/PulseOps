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
  ConditionReason,
  HubbardCondition,
  InclinationResult,
  MetricConditionEvaluation,
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
 * Umbral mínimo para considerar un valor como cercano a cero
 * Usado para evitar divisiones por cero y detectar inexistencia
 */
const ZERO_THRESHOLD = 0.001;

/**
 * Número mínimo de períodos consecutivos en Normal para considerar Poder
 */
const POWER_MIN_PERIODS = 3;

/**
 * Umbrales de inclinación para clasificación de condiciones
 * Estos valores son configurables y representan comportamientos relativos
 */
const INCLINATION_THRESHOLDS = {
  STEEP_POSITIVE: 50,      // Crecimiento pronunciado (Afluencia)
  MODERATE_POSITIVE: 10,   // Crecimiento moderado (Normal)
  FLAT_UPPER: 5,           // Límite superior de estabilidad
  FLAT_LOWER: -5,          // Límite inferior de estabilidad
  MODERATE_NEGATIVE: -20,  // Descenso moderado (Emergencia)
  STEEP_NEGATIVE: -50,     // Descenso pronunciado (Peligro)
  CRITICAL_NEGATIVE: -80,  // Caída casi vertical (Inexistencia)
};

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

// ============================================================================
// CAPA DE INCLINACIÓN: Cálculo porcentual y casos especiales
// ============================================================================

/**
 * Calcula la inclinación porcentual entre dos valores
 * 
 * Fórmula: I = ((E_act - E_ant) / E_ant) × 100
 * 
 * Casos especiales:
 * - Si E_ant ≈ 0: no se puede calcular porcentaje válido
 * - Si E_act ≈ 0 y E_ant > 0: caída crítica
 * - Si ambos ≈ 0: estado de confusión/inexistencia
 * 
 * @param previousValue - Valor anterior (E_ant)
 * @param currentValue - Valor actual (E_act)
 * @returns Resultado de inclinación con validación
 */
function calculateInclination(
  previousValue: number,
  currentValue: number
): InclinationResult {
  const delta = currentValue - previousValue;
  const isPreviousZero = Math.abs(previousValue) < ZERO_THRESHOLD;
  const isCurrentZero = Math.abs(currentValue) < ZERO_THRESHOLD;

  // Caso 1: Ambos valores cercanos a cero → Inexistencia/Confusión
  if (isPreviousZero && isCurrentZero) {
    return {
      value: null,
      previousValue,
      currentValue,
      delta,
      isValid: false,
    };
  }

  // Caso 2: E_ant ≈ 0 pero E_act > 0 → Inicio de existencia
  if (isPreviousZero && !isCurrentZero) {
    return {
      value: null, // No hay porcentaje válido
      previousValue,
      currentValue,
      delta,
      isValid: false,
    };
  }

  // Caso 3: E_ant > 0 pero E_act ≈ 0 → Caída crítica
  if (!isPreviousZero && isCurrentZero) {
    return {
      value: -100, // Representa caída total
      previousValue,
      currentValue,
      delta,
      isValid: true,
    };
  }

  // Caso 4: Cálculo normal
  const inclinationValue = (delta / previousValue) * 100;

  return {
    value: inclinationValue,
    previousValue,
    currentValue,
    delta,
    isValid: true,
  };
}

// ============================================================================
// CAPA DE RESOLUCIÓN DE CONDICIONES: Lógica jerárquica basada en Hubbard
// ============================================================================

/**
 * Verifica si una serie está en condición de Poder
 * 
 * Requisitos:
 * - Al menos POWER_MIN_PERIODS períodos
 * - Todos los períodos recientes muestran crecimiento o estabilidad
 * - Nivel sostenido alto relativo al histórico
 * 
 * @param points - Serie completa de puntos
 * @returns true si cumple criterios de Poder
 */
function isPowerCondition(
  points: Array<{ timestamp: string; value: number }>
): boolean {
  if (points.length < POWER_MIN_PERIODS) {
    return false;
  }

  // Analizar últimos N períodos
  const recentPoints = points.slice(-POWER_MIN_PERIODS);
  
  // Verificar que todos los períodos muestran Normal (crecimiento leve o estable)
  for (let i = 1; i < recentPoints.length; i++) {
    const prev = recentPoints[i - 1].value;
    const curr = recentPoints[i].value;
    const inclination = calculateInclination(prev, curr);
    
    if (!inclination.isValid) return false;
    if (inclination.value === null) return false;
    
    // Debe estar en rango de Normal o Afluencia (positivo)
    if (inclination.value < INCLINATION_THRESHOLDS.FLAT_LOWER) {
      return false;
    }
  }

  // Verificar nivel alto sostenido (último valor >= promedio histórico)
  const average = points.reduce((sum, p) => sum + p.value, 0) / points.length;
  const currentValue = recentPoints[recentPoints.length - 1].value;
  
  return currentValue >= average;
}

/**
 * Resuelve la condición operativa basada en inclinación e histórico
 * 
 * Jerarquía de evaluación (de mayor a menor):
 * 1. SIN_DATOS - Datos insuficientes o inválidos
 * 2. INEXISTENCIA - Caída casi vertical o inicio desde cero
 * 3. PELIGRO - Descenso pronunciado
 * 4. EMERGENCIA - Sin cambio o descenso moderado
 * 5. PODER - Normal sostenido en nivel alto
 * 6. AFLUENCIA - Crecimiento pronunciado
 * 7. NORMAL - Crecimiento gradual
 * 
 * @param inclination - Resultado del cálculo de inclinación
 * @param allPoints - Serie completa para análisis histórico
 * @returns Condición y razón
 */
function resolveCondition(
  inclination: InclinationResult,
  allPoints: Array<{ timestamp: string; value: number }>
): { condition: HubbardCondition; reason: ConditionReason } {
  // 1. SIN_DATOS: Inclinación no válida por datos insuficientes
  if (!inclination.isValid && inclination.value === null) {
    // Caso especial: ambos valores ≈ 0
    if (
      Math.abs(inclination.previousValue) < ZERO_THRESHOLD &&
      Math.abs(inclination.currentValue) < ZERO_THRESHOLD
    ) {
      return {
        condition: 'INEXISTENCIA',
        reason: {
          code: 'BOTH_ZERO',
          explanation: 'La estadística es inexistente o cercana a cero en ambos períodos',
        },
      };
    }

    // Inicio de existencia (de 0 a valor positivo)
    if (
      Math.abs(inclination.previousValue) < ZERO_THRESHOLD &&
      inclination.currentValue > ZERO_THRESHOLD
    ) {
      return {
        condition: 'INEXISTENCIA',
        reason: {
          code: 'EMERGENCE_FROM_ZERO',
          explanation: `La estadística pasó de inexistente a ${inclination.currentValue.toFixed(2)}. Inicio de actividad.`,
        },
      };
    }

    return {
      condition: 'SIN_DATOS',
      reason: {
        code: 'INVALID_CALCULATION',
        explanation: 'No se pudo calcular inclinación con los datos disponibles',
      },
    };
  }

  const inclinationValue = inclination.value!;

  // 2. INEXISTENCIA: Caída casi vertical (>80% de descenso)
  if (inclinationValue <= INCLINATION_THRESHOLDS.CRITICAL_NEGATIVE) {
    return {
      condition: 'INEXISTENCIA',
      reason: {
        code: 'VERTICAL_DROP',
        explanation: `Caída casi vertical de ${Math.abs(inclinationValue).toFixed(1)}%. La estadística colapsó.`,
        threshold: INCLINATION_THRESHOLDS.CRITICAL_NEGATIVE,
      },
    };
  }

  // 3. PELIGRO: Descenso pronunciado (entre -50% y -80%)
  if (inclinationValue <= INCLINATION_THRESHOLDS.STEEP_NEGATIVE) {
    return {
      condition: 'PELIGRO',
      reason: {
        code: 'STEEP_DECLINE',
        explanation: `Descenso pronunciado de ${Math.abs(inclinationValue).toFixed(1)}%. Requiere intervención inmediata.`,
        threshold: INCLINATION_THRESHOLDS.STEEP_NEGATIVE,
      },
    };
  }

  // 4. EMERGENCIA: Descenso moderado o sin cambio significativo (entre -20% y -50%)
  if (inclinationValue <= INCLINATION_THRESHOLDS.MODERATE_NEGATIVE) {
    return {
      condition: 'EMERGENCIA',
      reason: {
        code: 'MODERATE_DECLINE',
        explanation: `Descenso de ${Math.abs(inclinationValue).toFixed(1)}%. Se requiere acción correctiva.`,
        threshold: INCLINATION_THRESHOLDS.MODERATE_NEGATIVE,
      },
    };
  }

  // 5. EMERGENCIA: Estancamiento (entre -5% y +5%)
  if (
    inclinationValue >= INCLINATION_THRESHOLDS.FLAT_LOWER &&
    inclinationValue <= INCLINATION_THRESHOLDS.FLAT_UPPER
  ) {
    return {
      condition: 'EMERGENCIA',
      reason: {
        code: 'STAGNATION',
        explanation: `Sin cambio significativo (${inclinationValue.toFixed(1)}%). Estancamiento operativo.`,
        threshold: INCLINATION_THRESHOLDS.FLAT_UPPER,
      },
    };
  }

  // 6. AFLUENCIA: Crecimiento pronunciado (>50%)
  if (inclinationValue >= INCLINATION_THRESHOLDS.STEEP_POSITIVE) {
    return {
      condition: 'AFLUENCIA',
      reason: {
        code: 'STEEP_GROWTH',
        explanation: `Crecimiento pronunciado de ${inclinationValue.toFixed(1)}%. Condición de expansión.`,
        threshold: INCLINATION_THRESHOLDS.STEEP_POSITIVE,
      },
    };
  }

  // 7. PODER: Normal sostenido en nivel alto (verificar histórico)
  if (isPowerCondition(allPoints)) {
    return {
      condition: 'PODER',
      reason: {
        code: 'SUSTAINED_HIGH_NORMAL',
        explanation: `Funcionamiento Normal sostenido en nivel alto durante ${POWER_MIN_PERIODS}+ períodos. Condición de Poder.`,
      },
    };
  }

  // 8. NORMAL: Crecimiento gradual (entre 10% y 50%)
  if (inclinationValue >= INCLINATION_THRESHOLDS.MODERATE_POSITIVE) {
    return {
      condition: 'NORMAL',
      reason: {
        code: 'GRADUAL_GROWTH',
        explanation: `Crecimiento gradual de ${inclinationValue.toFixed(1)}%. Funcionamiento Normal.`,
        threshold: INCLINATION_THRESHOLDS.MODERATE_POSITIVE,
      },
    };
  }

  // 9. NORMAL: Crecimiento leve (entre 5% y 10%)
  return {
    condition: 'NORMAL',
    reason: {
      code: 'SLIGHT_GROWTH',
      explanation: `Crecimiento leve de ${inclinationValue.toFixed(1)}%. Funcionamiento Normal estable.`,
      threshold: INCLINATION_THRESHOLDS.MODERATE_POSITIVE,
    },
  };
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

  /**
   * Analiza una serie temporal con evaluación completa de condiciones Hubbard
   * 
   * Esta función extiende el análisis básico con:
   * - Cálculo de inclinación porcentual
   * - Análisis histórico completo
   * - Resolución de condiciones operativas jerárquicas
   * - Explicaciones detalladas
   * 
   * @param series - Serie temporal a analizar
   * @param config - Configuración de ventana (opcional)
   * @returns Evaluación completa con condición Hubbard
   */
  analyzeWithConditions(
    series: MetricSeries,
    config?: AnalysisWindowConfig
  ): MetricConditionEvaluation {
    const windowSize = config?.size ?? DEFAULT_WINDOW_SIZE;
    const evaluatedAt = new Date().toISOString();

    // Validación: verificar que hay datos suficientes
    if (!series.points || series.points.length < windowSize) {
      return {
        metricId: series.metricId,
        windowUsed: series.points?.length ?? 0,
        periodType: 'WEEK',
        inclination: {
          value: null,
          previousValue: 0,
          currentValue: 0,
          delta: 0,
          isValid: false,
        },
        direction: 'INSUFFICIENT_DATA',
        condition: 'SIN_DATOS',
        reason: {
          code: 'INSUFFICIENT_DATA',
          explanation: `Se requieren al menos ${windowSize} períodos para el análisis. Datos disponibles: ${series.points?.length ?? 0}`,
        },
        evaluatedAt,
        confidence: 0,
      };
    }

    // Extraer los últimos N puntos según el tamaño de ventana
    const relevantPoints = series.points.slice(-windowSize);
    const windowUsed = relevantPoints.length;

    // Obtener el punto anterior y el actual
    const previousPoint = relevantPoints[windowUsed - 2];
    const currentPoint = relevantPoints[windowUsed - 1];

    // Calcular inclinación porcentual
    const inclination = calculateInclination(
      previousPoint.value,
      currentPoint.value
    );

    // Determinar dirección básica
    const direction = determineTrendDirection(inclination.delta);

    // Resolver condición operativa jerárquica
    const { condition, reason } = resolveCondition(
      inclination,
      series.points
    );

    // Calcular confianza basada en cantidad de datos
    // Más datos históricos = mayor confianza
    const confidence = Math.min(series.points.length / 10, 1);

    return {
      metricId: series.metricId,
      windowUsed,
      periodType: 'WEEK',
      inclination,
      direction,
      condition,
      reason,
      evaluatedAt,
      confidence,
    };
  }
}

/**
 * Instancia del motor de análisis con métodos públicos
 */
const engineInstance = new TrendAnalysisEngine();

/**
 * Exporta una instancia única del motor de análisis
 */
export const analysisEngine = {
  /**
   * Análisis básico de tendencia (compatible con versión anterior)
   */
  analyze: (series: MetricSeries, config?: AnalysisWindowConfig) =>
    engineInstance.analyze(series, config),

  /**
   * Análisis avanzado con condiciones operativas Hubbard
   */
  analyzeWithConditions: (series: MetricSeries, config?: AnalysisWindowConfig) =>
    engineInstance.analyzeWithConditions(series, config),
};

/**
 * Exporta la clase para casos de testing o instanciación personalizada
 */
export { TrendAnalysisEngine };

/**
 * Exporta función de cálculo de inclinación para uso directo
 */
export { calculateInclination };
