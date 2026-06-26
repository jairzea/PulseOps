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
  AnalysisSignal,
  AnalysisWindowConfig,
  ConditionReason,
  HubbardCondition,
  InclinationResult,
  MetricConditionEvaluation,
  MetricPoint,
  MetricSeries,
  OperationalCondition,
  TrendAnalysisResult,
  TrendDirection,
  TrendEvaluation,
  ConditionThresholds,
  ConditionScoreTable,
  ConsolidatedLevelThresholds,
  ConsolidatedMetricInput,
  ConsolidatedEvaluation,
  ConsolidatedContribution,
} from '@pulseops/shared-types';

/**
 * Configuración por defecto de la ventana de análisis
 */
const DEFAULT_WINDOW_SIZE = 2;

/**
 * Valores por defecto de umbrales (coinciden con createDefaultConfiguration en backend)
 */
const DEFAULT_CONDITION_THRESHOLDS: ConditionThresholds = {
  afluencia: { minInclination: 50 },
  normal: { minInclination: 5, maxInclination: 50 },
  emergencia: { minInclination: -5, maxInclination: 5 },
  peligro: { minInclination: -80, maxInclination: -50 },
  poder: { minConsecutivePeriods: 3, minInclination: -5, stabilityThreshold: 0.1 },
  inexistencia: { threshold: 0.01 },
  signals: {
    volatility: { minDirectionChanges: 3, minWindowSize: 5 },
    slowDecline: { minConsecutiveDeclines: 3, maxInclinationPerPeriod: -5 },
    dataGaps: { expectedDaysBetweenPoints: 7, toleranceDays: 2 },
    recoverySpike: { minPriorDeclines: 2, minRecoveryInclination: 50 },
    noise: { maxInclinationVariation: 5, minWindowSize: 4 },
  },
};



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
 * Mínimo de puntos para poder calcular una inclinación (par consecutivo). El
 * `windowSize` es un TOPE (últimas N semanas a analizar), no un mínimo: si hay menos
 * puntos que la ventana, se analizan todos los disponibles.
 */
const MIN_POINTS_FOR_ANALYSIS = 2;

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

// ============================================================================
// META-ANÁLISIS: Detectores de patrones peligrosos y volatilidad
// ============================================================================

/**
 * Detecta deterioro lento pero persistente
 * 
 * Algoritmo:
 * - Analiza últimos N=4 períodos
 * - Cuenta inclinaciones negativas consecutivas
 * - Si hay 3+ caídas (aunque pequeñas) → SLOW_DECLINE
 * - Severity basada en cantidad de caídas y magnitud acumulada
 * 
 * @param points - Serie temporal completa
 * @returns Señal de deterioro lento o null
 */
function detectSlowDecline(points: MetricPoint[], signalsCfg: ConditionThresholds['signals']): AnalysisSignal | null {
  const WINDOW = 4;
  if (points.length < WINDOW + 1) return null;

  const recentPoints = points.slice(-(WINDOW + 1));
  let negativeCount = 0;
  let totalInclinationSum = 0;

  for (let i = 1; i < recentPoints.length; i++) {
    const prev = recentPoints[i - 1].value;
    const curr = recentPoints[i].value;
    const inclination = calculateInclination(prev, curr);
    
    // Solo considerar inclinaciones válidas
    if (!inclination.isValid || inclination.value === null) {
      continue;
    }
    
    totalInclinationSum += inclination.value;
    
    if (inclination.value < 0) {
      negativeCount++;
    }
  }

  // Criterio: N caídas definidas en configuración y suma de inclinaciones negativa
  const minDeclines = signalsCfg?.slowDecline?.minConsecutiveDeclines ?? 3;
  if (negativeCount >= minDeclines && totalInclinationSum < 0) {
    const severity: 'LOW' | 'MEDIUM' | 'HIGH' = 
      negativeCount === WINDOW ? 'HIGH' :
      negativeCount === minDeclines ? 'MEDIUM' : 'LOW';

    return {
      type: 'SLOW_DECLINE',
      severity,
      explanation: `Deterioro persistente detectado: ${negativeCount} de ${WINDOW} períodos con caídas`,
      windowUsed: WINDOW,
      evidence: {
        negativePeriodsCount: negativeCount,
        totalInclinationSum: Math.round(totalInclinationSum * 100) / 100,
      },
    };
  }

  return null;
}

/**
 * Detecta volatilidad / patrón de serrucho
 * 
 * Algoritmo:
 * - Analiza últimos N=5 puntos
 * - Cuenta cambios de signo en delta (sube/baja alternado)
 * - Si alterna 3+ veces → VOLATILE
 * 
 * @param points - Serie temporal completa
 * @returns Señal de volatilidad o null
 */
function detectVolatility(points: MetricPoint[], signalsCfg: ConditionThresholds['signals']): AnalysisSignal | null {
  const WINDOW = signalsCfg?.volatility?.minWindowSize ?? 5;
  if (points.length < WINDOW) return null;

  const recentPoints = points.slice(-WINDOW);
  const deltas: number[] = [];

  for (let i = 1; i < recentPoints.length; i++) {
    const delta = recentPoints[i].value - recentPoints[i - 1].value;
    // Filtrar deltas cero para evitar diluir el conteo de cambios de signo
    if (delta !== 0) {
      deltas.push(delta);
    }
  }

  // Se necesitan al menos 2 deltas no cero para detectar cambios de signo
  if (deltas.length < 2) return null;

  // Contar cambios de signo (solo entre positivos y negativos reales)
  let signChanges = 0;
  for (let i = 1; i < deltas.length; i++) {
    if ((deltas[i] > 0 && deltas[i - 1] < 0) || 
        (deltas[i] < 0 && deltas[i - 1] > 0)) {
      signChanges++;
    }
  }

  // Criterio: N cambios de signo según configuración
  const minChanges = signalsCfg?.volatility?.minDirectionChanges ?? 3;
  if (signChanges >= minChanges) {
    const severity: 'LOW' | 'MEDIUM' | 'HIGH' = 
      signChanges === deltas.length - 1 ? 'HIGH' : // Todos cambian
      signChanges >= minChanges ? 'MEDIUM' : 'LOW';

    return {
      type: 'VOLATILE',
      severity,
      explanation: `Patrón de serrucho detectado: ${signChanges} cambios de dirección en ${deltas.length - 1} transiciones`,
      windowUsed: WINDOW,
      evidence: {
        signChangesCount: signChanges,
        transitionsAnalyzed: deltas.length,
      },
    };
  }

  return null;
}

/**
 * Detecta gaps/saltos en la serie temporal
 * 
 * Algoritmo:
 * - Asume periodicidad semanal (7 días ± 2 días de tolerancia)
 * - Detecta saltos mayores a 9 días entre timestamps consecutivos
 * 
 * @param points - Serie temporal completa
 * @returns Señal de gaps o null
 */
function detectDataGaps(points: MetricPoint[], signalsCfg: ConditionThresholds['signals']): AnalysisSignal | null {
  if (points.length < 2) return null;

  const EXPECTED_DAYS = signalsCfg?.dataGaps?.expectedDaysBetweenPoints ?? 7;
  const TOLERANCE_DAYS = signalsCfg?.dataGaps?.toleranceDays ?? 2;
  const MAX_GAP_MS = (EXPECTED_DAYS + TOLERANCE_DAYS) * 24 * 60 * 60 * 1000;

  let gapCount = 0;
  let largestGapDays = 0;

  for (let i = 1; i < points.length; i++) {
    const prevTime = new Date(points[i - 1].timestamp).getTime();
    const currTime = new Date(points[i].timestamp).getTime();
    const diffMs = currTime - prevTime;

    if (diffMs > MAX_GAP_MS) {
      gapCount++;
      const daysDiff = Math.round(diffMs / (24 * 60 * 60 * 1000));
      // Calcular explícitamente el mayor salto
      if (daysDiff > largestGapDays) {
        largestGapDays = daysDiff;
      }
    }
  }

  if (gapCount > 0) {
    const severity: 'LOW' | 'MEDIUM' | 'HIGH' = 
      gapCount >= 3 ? 'HIGH' :
      gapCount === 2 ? 'MEDIUM' : 'LOW';

    return {
      type: 'DATA_GAPS',
      severity,
      explanation: `${gapCount} gap(s) detectado(s) en la serie temporal`,
      windowUsed: points.length,
      evidence: {
        gapCount,
        largestGapDays,
      },
    };
  }

  return null;
}

/**
 * Detecta recuperación brusca tras deterioro
 * 
 * Algoritmo:
 * - Busca 2+ caídas consecutivas
 * - Seguidas de un crecimiento >= +50% (Afluencia)
 * 
 * @param points - Serie temporal completa
 * @returns Señal de recuperación o null
 */
function detectRecoverySpike(points: MetricPoint[], signalsCfg: ConditionThresholds['signals']): AnalysisSignal | null {
  const WINDOW = signalsCfg?.recoverySpike?.minPriorDeclines ? signalsCfg.recoverySpike.minPriorDeclines + 3 : 5;
  if (points.length < WINDOW) return null;

  const recentPoints = points.slice(-WINDOW);
  
  // Verificar último movimiento primero (debe ser spike)
  const lastIdx = recentPoints.length - 1;
  const lastInclination = calculateInclination(
    recentPoints[lastIdx - 1].value,
    recentPoints[lastIdx].value
  );

  if (
    !lastInclination.isValid ||
    lastInclination.value === null ||
    lastInclination.value < (signalsCfg.recoverySpike?.minRecoveryInclination ?? 50)
  ) {
    return null; // No hay spike, no puede haber recovery
  }

  // Analizar desde el penúltimo punto hacia atrás
  // Contar caídas consecutivas inmediatamente antes del spike
  let consecutiveDeclines = 0;
  
  for (let i = lastIdx - 1; i > 0; i--) {
    const delta = recentPoints[i].value - recentPoints[i - 1].value;
    if (delta < 0) {
      consecutiveDeclines++;
    } else {
      break; // Detenerse al primer período no negativo
    }
  }

  // Criterio: mínimo 2 caídas consecutivas antes del spike
  if (consecutiveDeclines >= 2) {
    return {
      type: 'RECOVERY_SPIKE',
      severity: 'MEDIUM',
      explanation: `Recuperación brusca (+${Math.round(lastInclination.value)}%) tras ${consecutiveDeclines} caídas consecutivas`,
      windowUsed: WINDOW,
      evidence: {
        declinesBeforeSpike: consecutiveDeclines,
        recoveryInclination: Math.round(lastInclination.value),
      },
    };
  }

  return null;
}

/**
 * Detecta ruido (cambios insignificantes)
 * 
 * Algoritmo:
 * - Analiza últimos N=4 períodos
 * - Si todos los cambios están dentro de ±2% → NOISE
 * 
 * @param points - Serie temporal completa
 * @returns Señal de ruido o null
 */
function detectNoise(points: MetricPoint[], signalsCfg: ConditionThresholds['signals']): AnalysisSignal | null {
  const WINDOW = signalsCfg?.noise?.minWindowSize ?? 4;
  const NOISE_THRESHOLD = signalsCfg?.noise?.maxInclinationVariation ?? 2; // ±2%
  const ABSOLUTE_NOISE_THRESHOLD = 1; // Umbral absoluto para valores cercanos a 0

  if (points.length < WINDOW + 1) return null;

  const recentPoints = points.slice(-(WINDOW + 1));
  let allWithinNoise = true;

  for (let i = 1; i < recentPoints.length; i++) {
    const inclination = calculateInclination(
      recentPoints[i - 1].value,
      recentPoints[i].value
    );

    // Si la inclinación es válida, usar porcentaje
    if (inclination.isValid && inclination.value !== null) {
      if (Math.abs(inclination.value) > NOISE_THRESHOLD) {
        allWithinNoise = false;
        break;
      }
    } else {
      // Fallback: usar delta absoluto cuando E_ant ≈ 0
      const delta = Math.abs(inclination.delta);
      if (delta > ABSOLUTE_NOISE_THRESHOLD) {
        allWithinNoise = false;
        break;
      }
    }
  }

  if (allWithinNoise) {
    return {
      type: 'NOISE',
      severity: 'LOW',
      explanation: `Sin señal clara: todos los cambios están dentro de ±${NOISE_THRESHOLD}%`,
      windowUsed: WINDOW,
      evidence: {
        noiseThreshold: NOISE_THRESHOLD,
      },
    };
  }

  return null;
}

/**
 * Ejecuta todos los detectores de patrones y retorna señales encontradas
 * 
 * @param points - Serie temporal completa
 * @returns Array de señales detectadas (puede estar vacío)
 */
function detectPatterns(points: MetricPoint[], signalsCfg: ConditionThresholds['signals']): AnalysisSignal[] {
  const signals: AnalysisSignal[] = [];

  // Ejecutar todos los detectores
  const slowDecline = detectSlowDecline(points, signalsCfg);
  const volatility = detectVolatility(points, signalsCfg);
  const dataGaps = detectDataGaps(points, signalsCfg);
  const recoverySpike = detectRecoverySpike(points, signalsCfg);
  const noise = detectNoise(points, signalsCfg);

  // Agregar señales detectadas
  if (slowDecline) signals.push(slowDecline);
  if (dataGaps) signals.push(dataGaps);
  if (recoverySpike) signals.push(recoverySpike);
  
  // Evitar contradicciones: si NOISE está presente, no incluir VOLATILE
  if (noise) {
    signals.push(noise);
  } else if (volatility) {
    signals.push(volatility);
  }

  return signals;
}

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
 * Regresión lineal por mínimos cuadrados sobre la serie, usando el índice (0..n-1)
 * como eje X. Misma fórmula que `frontend/utils/chartUtils.calculateLinearRegression`,
 * portada al motor para DECIDIR condición, no solo para dibujar.
 *
 * ponytail: regresión lineal simple O(n) sobre la ventana; suficiente para ≤ ~52
 * semanas. Si en el futuro se requiere ponderar puntos recientes, el upgrade es una
 * regresión ponderada en este mismo helper.
 */
function linearRegression(
  points: Array<{ value: number }>,
): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: n === 1 ? points[0].value : 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const y = points[i].value;
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Calcula la condición de TENDENCIA sobre el periodo completo de la ventana.
 *
 * En vez de comparar los últimos 2 puntos crudos (condición temprana), ajusta una
 * recta a TODOS los puntos y deriva una inclinación porcentual desde los extremos de
 * la recta ajustada (inicio vs fin del periodo). Esa inclinación se pasa por la MISMA
 * jerarquía (`resolveCondition`) y los MISMOS umbrales que la condición temprana, así
 * que no introduce umbrales de negocio nuevos.
 */
function evaluateTrend(
  windowPoints: Array<{ timestamp: string; value: number }>,
  thresholds: ConditionThresholds,
): TrendEvaluation {
  if (windowPoints.length < 2) {
    return {
      condition: 'SIN_DATOS',
      reason: {
        code: 'INSUFFICIENT_DATA',
        explanation: 'Se requieren al menos 2 períodos para la tendencia del periodo.',
      },
      inclination: {
        value: null,
        previousValue: windowPoints[0]?.value ?? 0,
        currentValue: windowPoints[0]?.value ?? 0,
        delta: 0,
        isValid: false,
      },
      slope: 0,
    };
  }

  const { slope, intercept } = linearRegression(windowPoints);
  const startFit = intercept; // fit(0)
  const endFit = slope * (windowPoints.length - 1) + intercept; // fit(n-1)

  // Inclinación equivalente entre extremos de la recta ajustada. Reutiliza los casos
  // especiales de cero/inicio/caída de calculateInclination.
  const inclination = calculateInclination(startFit, endFit);
  const { condition, reason } = resolveCondition(inclination, windowPoints, thresholds);

  return { condition, reason, inclination, slope };
}


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
  points: Array<{ timestamp: string; value: number }>,
  thresholds: ConditionThresholds,
): boolean {
  const minPeriods = thresholds.poder?.minConsecutivePeriods ?? POWER_MIN_PERIODS;
  if (points.length < minPeriods) {
    return false;
  }

  // Analizar últimos N períodos
  const recentPoints = points.slice(-POWER_MIN_PERIODS);
  
  // Verificar que todos los períodos recientes muestran crecimiento NORMAL real
  for (let i = 1; i < recentPoints.length; i++) {
    const prev = recentPoints[i - 1].value;
    const curr = recentPoints[i].value;
    const inclination = calculateInclination(prev, curr);

    if (!inclination.isValid) return false;
    if (inclination.value === null) return false;

    // Cada período debe ser crecimiento NORMAL real: +5% < I < +50%
    // (spec formal: "PODER — Histórico: todos +5% < I < +50%"). El estancamiento
    // (−5% ≤ I ≤ +5%) NO es PODER, es EMERGENCIA; una línea plana no debe marcar Poder.
    const normalMin = thresholds.normal?.minInclination ?? 5;
    const normalMax = thresholds.normal?.maxInclination ?? 50;
    if (inclination.value <= normalMin || inclination.value >= normalMax) {
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
 * Jerarquía de evaluación (orden oficial según especificación formal):
 * 1. SIN_DATOS / INEXISTENCIA - Datos insuficientes o colapso
 * 2. PODER - Normal sostenido en nivel alto
 * 3. AFLUENCIA - Crecimiento pronunciado
 * 4. NORMAL - Crecimiento gradual esperado
 * 5. EMERGENCIA - Estancamiento o descenso leve/moderado
 * 6. PELIGRO - Descenso pronunciado
 * 
 * @param inclination - Resultado del cálculo de inclinación
 * @param allPoints - Serie completa para análisis histórico
 * @returns Condición y razón
 */
function resolveCondition(
  inclination: InclinationResult,
  allPoints: Array<{ timestamp: string; value: number }>,
  thresholds: ConditionThresholds,
): { condition: HubbardCondition; reason: ConditionReason } {
  // =========================================================================
  // 1. SIN_DATOS / INEXISTENCIA: Casos bloqueantes técnicos
  // =========================================================================
  
  // 1a. SIN_DATOS: Inclinación no válida por datos insuficientes
  const zeroThreshold = thresholds?.inexistencia?.threshold ?? ZERO_THRESHOLD;
  if (!inclination.isValid && inclination.value === null) {
    // Caso especial: ambos valores ≈ 0
    if (
      Math.abs(inclination.previousValue) < zeroThreshold &&
      Math.abs(inclination.currentValue) < zeroThreshold
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
      Math.abs(inclination.previousValue) < zeroThreshold &&
      inclination.currentValue > zeroThreshold
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

  // 1b. INEXISTENCIA: Caída casi vertical (usar umbral de peligro.minInclination)
  if (inclinationValue <= (thresholds?.peligro?.minInclination ?? -80)) {
    return {
      condition: 'INEXISTENCIA',
      reason: {
        code: 'VERTICAL_DROP',
        explanation: `Caída casi vertical de ${Math.abs(inclinationValue).toFixed(1)}%. La estadística colapsó.`,
        threshold: thresholds?.peligro?.minInclination ?? -80,
      },
    };
  }

  // =========================================================================
  // 2. PODER: Estado operativo superior (acumulativo, no puntual)
  // =========================================================================
  
  // PODER se evalúa ANTES que AFLUENCIA
  // Un crecimiento fuerte puntual (AFLUENCIA) NO anula PODER sostenido
  if (isPowerCondition(allPoints, thresholds)) {
    return {
      condition: 'PODER',
      reason: {
        code: 'SUSTAINED_HIGH_NORMAL',
        explanation: `Funcionamiento Normal sostenido en nivel alto durante ${thresholds.poder?.minConsecutivePeriods ?? POWER_MIN_PERIODS}+ períodos. Condición de Poder.`,
      },
    };
  }

  // =========================================================================
  // 3. AFLUENCIA: Expansión acelerada (puntual, no sostenible)
  // =========================================================================
  
  if (inclinationValue >= (thresholds.afluencia?.minInclination ?? 50)) {
    return {
      condition: 'AFLUENCIA',
      reason: {
        code: 'STEEP_GROWTH',
        explanation: `Crecimiento pronunciado de ${inclinationValue.toFixed(1)}%. Condición de expansión.`,
        threshold: thresholds.afluencia?.minInclination ?? 50,
      },
    };
  }

  // =========================================================================
  // 4. NORMAL: Funcionamiento esperado y saludable
  // =========================================================================
  
  // NORMAL requiere crecimiento REAL: +5% < I < +50%
  // NO incluye estancamiento (≤ +5%)
  if (
    inclinationValue > (thresholds.normal?.minInclination ?? 5) &&
    inclinationValue < (thresholds.afluencia?.minInclination ?? 50)
  ) {
    // Distinguir entre crecimiento gradual y leve
    const moderatePositive = ((thresholds.normal?.minInclination ?? 5) + (thresholds.afluencia?.minInclination ?? 50)) / 2;
    if (inclinationValue >= moderatePositive) {
      return {
        condition: 'NORMAL',
        reason: {
          code: 'GRADUAL_GROWTH',
          explanation: `Crecimiento gradual de ${inclinationValue.toFixed(1)}%. Funcionamiento Normal.`,
          threshold: moderatePositive,
        },
      };
    }
    
    return {
      condition: 'NORMAL',
      reason: {
        code: 'SLIGHT_GROWTH',
        explanation: `Crecimiento leve de ${inclinationValue.toFixed(1)}%. Funcionamiento Normal estable.`,
        threshold: thresholds.normal?.minInclination ?? (INCLINATION_THRESHOLDS.FLAT_UPPER),
      },
    };
  }

  // =========================================================================
  // 5. EMERGENCIA: Pérdida de control incipiente
  // =========================================================================
  
  // 5a. EMERGENCIA por estancamiento (entre -5% y +5%)
  if (
    inclinationValue >= (thresholds.emergencia?.minInclination ?? -5) &&
    inclinationValue <= (thresholds.emergencia?.maxInclination ?? 5)
  ) {
    return {
      condition: 'EMERGENCIA',
      reason: {
        code: 'STAGNATION',
        explanation: `Sin cambio significativo (${inclinationValue.toFixed(1)}%). Estancamiento operativo.`,
        threshold: thresholds.emergencia?.maxInclination ?? 5,
      },
    };
  }

  // 5b. EMERGENCIA por descenso leve/moderado (entre -50% y -5%)
  if (inclinationValue > (thresholds.peligro?.maxInclination ?? -50)) {
    return {
      condition: 'EMERGENCIA',
      reason: {
        code: 'MODERATE_DECLINE',
        explanation: `Descenso de ${Math.abs(inclinationValue).toFixed(1)}%. Se requiere acción correctiva.`,
        threshold: thresholds.peligro?.maxInclination ?? -50,
      },
    };
  }

  // =========================================================================
  // 6. PELIGRO: Deterioro pronunciado (última condición posible)
  // =========================================================================
  
  // PELIGRO es la última condición evaluable cuando nada más aplica
  // Descenso pronunciado (entre -80% y -50%)
  return {
    condition: 'PELIGRO',
    reason: {
      code: 'STEEP_DECLINE',
      explanation: `Descenso pronunciado de ${Math.abs(inclinationValue).toFixed(1)}%. Requiere intervención inmediata.`,
      threshold: thresholds.peligro?.maxInclination ?? -50,
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

    // Validación: se requieren al menos 2 puntos para calcular inclinación. windowSize
    // es un tope (últimas N), no un mínimo.
    if (!series.points || series.points.length < MIN_POINTS_FOR_ANALYSIS) {
      return {
        metricId: series.metricId,
        windowUsed: series.points?.length ?? 0,
        direction: 'INSUFFICIENT_DATA',
        delta: null,
        condition: 'SIN_DATOS',
        evaluatedAt,
      };
    }

    // Extraer los últimos N puntos según el tamaño de ventana (o todos si hay menos)
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

    // Validación: se requieren al menos 2 puntos para calcular inclinación. windowSize
    // es un tope (últimas N semanas a analizar), no un mínimo de puntos requeridos.
    if (!series.points || series.points.length < MIN_POINTS_FOR_ANALYSIS) {
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
          explanation: `Se requieren al menos ${MIN_POINTS_FOR_ANALYSIS} períodos para el análisis. Datos disponibles: ${series.points?.length ?? 0}`,
        },
        signals: [], // Sin señales por falta de datos
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
    const thresholds = config?.thresholds ?? DEFAULT_CONDITION_THRESHOLDS;
    const { condition, reason } = resolveCondition(inclination, series.points, thresholds);

    // Detectar patrones adicionales (meta-análisis)
    const signals = detectPatterns(series.points, thresholds.signals);

    // Condición de tendencia sobre la ventana completa (regresión lineal)
    const trend = evaluateTrend(relevantPoints, thresholds);

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
      signals,
      trend,
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
 * Tabla de puntajes por defecto (confirmada por Laura/Merce). Configurable vía la
 * configuración activa; este es el fallback cuando no se provee.
 */
const DEFAULT_SCORE_TABLE: ConditionScoreTable = {
  PODER: 10,
  AFLUENCIA: 7,
  NORMAL: 5,
  EMERGENCIA: 3,
  PELIGRO: 1,
  INEXISTENCIA: 0,
  SIN_DATOS: 0,
  CAMBIO_DE_PODER: 0,
};

/**
 * Umbrales de nivel por defecto del consolidado. Pensados para que UNA sola métrica
 * mapee a su propia condición (ej. PODER=10/10=1.0 → PODER; NORMAL=5/10=0.5 → NORMAL).
 */
const DEFAULT_CONSOLIDATED_LEVELS: ConsolidatedLevelThresholds = {
  poder: 0.9,
  afluencia: 0.65,
  normal: 0.45,
  emergencia: 0.25,
  peligro: 0.05,
};

/**
 * Mapea un ratio de nivel (0..1) a condición consolidada según umbrales configurables.
 */
function levelRatioToCondition(
  ratio: number,
  levels: ConsolidatedLevelThresholds,
): HubbardCondition {
  if (ratio >= levels.poder) return 'PODER';
  if (ratio >= levels.afluencia) return 'AFLUENCIA';
  if (ratio >= levels.normal) return 'NORMAL';
  if (ratio >= levels.emergencia) return 'EMERGENCIA';
  if (ratio >= levels.peligro) return 'PELIGRO';
  return 'INEXISTENCIA';
}

/**
 * Condición consolidada de producción de un recurso (Fase 2).
 *
 * Método (revisado 2026-06-26 — basado en NIVEL, no en inclinación de totales):
 *  1. Cada métrica de producción se evalúa sobre la ventana → su condición actual
 *     (analyzeWithConditions) → puntaje según scoreTable.
 *  2. Nivel consolidado = Σ puntajes / (nº métricas × puntaje máximo). Ratio 0..1.
 *  3. El ratio se mapea a condición vía umbrales de nivel configurables.
 *
 * Por qué nivel y no inclinación de totales: una métrica en NORMAL sostenido tiene
 * puntaje plano (5,5,5); su inclinación es 0 → daría EMERGENCIA aunque la persona esté
 * produciendo bien. El nivel refleja "qué tan bien produce", que es lo que evalúa Laura.
 *
 * Reglas de dominio:
 *  - Regla dura: si TODAS las métricas de producción están en cero esta ventana
 *    (puntaje total 0) → INEXISTENCIA.
 *
 * Puro y determinístico: sin I/O ni estado.
 */
function analyzeConsolidated(
  metrics: ConsolidatedMetricInput[],
  config?: {
    size?: number;
    thresholds?: ConditionThresholds;
    scoreTable?: ConditionScoreTable;
    levels?: ConsolidatedLevelThresholds;
  },
): ConsolidatedEvaluation {
  const thresholds = config?.thresholds ?? DEFAULT_CONDITION_THRESHOLDS;
  const scoreTable = config?.scoreTable ?? thresholds.scoreTable ?? DEFAULT_SCORE_TABLE;
  const levels = config?.levels ?? thresholds.consolidatedLevels ?? DEFAULT_CONSOLIDATED_LEVELS;
  const evaluatedAt = new Date().toISOString();

  const size = config?.size;
  const maxScore = scoreTable.PODER;

  // 1. Condición actual de cada métrica sobre la ventana → puntaje.
  const contributions: ConsolidatedContribution[] = [];
  let windowUsed = 0;
  for (const m of metrics) {
    if (!m.points || m.points.length === 0) continue;
    const series: MetricSeries = {
      metricId: m.metricKey,
      points: m.points.map((p) => ({ timestamp: p.week, value: p.value })),
    };
    const evalSize = size ?? m.points.length;
    const evaluation = engineInstance.analyzeWithConditions(series, { size: evalSize, thresholds });
    windowUsed = Math.max(windowUsed, evaluation.windowUsed);
    contributions.push({
      metricKey: m.metricKey,
      condition: evaluation.condition,
      score: scoreTable[evaluation.condition] ?? 0,
    });
  }

  // Sin métricas evaluables → SIN_DATOS.
  if (contributions.length === 0) {
    return {
      resourceId: '',
      condition: 'SIN_DATOS',
      reason: { code: 'INSUFFICIENT_DATA', explanation: 'No hay métricas de producción evaluables.' },
      levelRatio: 0,
      maxScore,
      metrics: [],
      windowUsed: 0,
      evaluatedAt,
    };
  }

  // 2. Nivel = puntaje promedio normalizado contra el techo (PODER).
  const totalScore = contributions.reduce((sum, c) => sum + c.score, 0);
  const levelRatio = maxScore > 0 ? totalScore / (contributions.length * maxScore) : 0;

  // Regla dura: producción nula (todas en 0) → INEXISTENCIA.
  let condition: HubbardCondition;
  let reason: ConditionReason;
  if (totalScore === 0) {
    condition = 'INEXISTENCIA';
    reason = {
      code: 'ZERO_PRODUCTION',
      explanation: 'La producción consolidada es nula. Condición de Inexistencia.',
    };
  } else {
    // 3. Mapear ratio de nivel → condición.
    condition = levelRatioToCondition(levelRatio, levels);
    const ceiling = contributions.length * maxScore;
    reason = {
      code: 'CONSOLIDATED_LEVEL',
      explanation: `Nivel ${(levelRatio * 100).toFixed(0)}% (${totalScore}/${ceiling} pts en ${contributions.length} métrica(s) de producción). Condición consolidada: ${condition}.`,
    };
  }

  return {
    resourceId: '',
    condition,
    reason,
    levelRatio,
    maxScore,
    metrics: contributions,
    windowUsed,
    evaluatedAt,
  };
}

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

  /**
   * Condición consolidada de producción de un recurso (Fase 2)
   */
  analyzeConsolidated: (
    metrics: ConsolidatedMetricInput[],
    config?: {
      size?: number;
      thresholds?: ConditionThresholds;
      scoreTable?: ConditionScoreTable;
      levels?: ConsolidatedLevelThresholds;
    },
  ) => analyzeConsolidated(metrics, config),
};

/**
 * Exporta la clase para casos de testing o instanciación personalizada
 */
export { TrendAnalysisEngine };

/**
 * Exporta función de cálculo de inclinación para uso directo
 */
export { calculateInclination };
