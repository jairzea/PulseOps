/**
 * Self-check ejecutable del motor (sin framework, asserts de node:assert).
 *
 * Verifica la corrección del bug de PODER: una línea casi plana (estancamiento)
 * NO debe marcar PODER; PODER requiere crecimiento Normal real (+5% < I < +50%)
 * sostenido en los últimos períodos (spec formal del dominio).
 *
 * Ejecutar: npx ts-node src/engine.selfcheck.ts  (desde packages/analysis-engine)
 */
import assert from 'node:assert';
import { analysisEngine } from './engine';
import type { MetricSeries, ConsolidatedMetricInput } from '@pulseops/shared-types';

const week = (i: number) =>
  new Date(2026, 0, 1 + i * 7).toISOString();

const series = (values: number[]): MetricSeries => ({
  metricId: 'selfcheck',
  points: values.map((value, i) => ({ timestamp: week(i), value })),
});

const condition = (values: number[]) =>
  analysisEngine.analyzeWithConditions(series(values), { size: 2 }).condition;

// Condición de tendencia sobre toda la ventana (regresión). windowSize = nº de puntos.
const trendCondition = (values: number[]) =>
  analysisEngine.analyzeWithConditions(series(values), { size: values.length }).trend?.condition;

let failures = 0;
const check = (name: string, actual: string | undefined, expected: string) => {
  try {
    assert.strictEqual(actual, expected);
    console.log(`  ✓ ${name} → ${actual}`);
  } catch {
    failures++;
    console.error(`  ✗ ${name}: esperado ${expected}, obtenido ${actual}`);
  }
};

const checkNot = (name: string, actual: string | undefined, notExpected: string) => {
  try {
    assert.notStrictEqual(actual, notExpected);
    console.log(`  ✓ ${name} → ${actual} (≠ ${notExpected})`);
  } catch {
    failures++;
    console.error(`  ✗ ${name}: no debía ser ${notExpected}, obtenido ${actual}`);
  }
};

console.log('Self-check motor — condición PODER:');

// Bug Helena: 2 puntos con windowSize 8 NO debe dar SIN_DATOS (windowSize es tope, no
// mínimo). 10→20 = +100% sostenido → debe evaluar (AFLUENCIA/PODER), nunca SIN_DATOS.
const twoPointsWide = analysisEngine.analyzeWithConditions(
  series([10, 20]),
  { size: 8 },
);
checkNot('2 puntos con ventana 8 no es SIN_DATOS', twoPointsWide.condition, 'SIN_DATOS');

// Línea casi plana (micro-variaciones < ±5%): estancamiento → NO es PODER.
check('línea plana (estancamiento)', condition([50, 52, 49, 51, 50, 52, 48, 50]), 'EMERGENCIA');

// Crecimiento Normal real sostenido (+5%..+50% en cada período) → PODER.
check('crecimiento Normal sostenido', condition([100, 108, 115, 122]), 'PODER');

// Crecimiento moderado en el último cambio, sin sostenibilidad previa → NORMAL.
check('crecimiento moderado puntual', condition([60, 63, 66, 69, 72, 70, 64, 72]), 'NORMAL');

// Caída pronunciada final → PELIGRO.
check('caída pronunciada', condition([85, 80, 74, 68, 62, 60, 58, 25]), 'PELIGRO');

console.log('\nSelf-check motor — condición de TENDENCIA (regresión sobre la ventana):');

// Crecimiento lineal fuerte y sostenido (+10% cada período) → PODER (Normal sostenido).
// PODER se evalúa antes que AFLUENCIA en la jerarquía; la tendencia reutiliza esa lógica.
check('tendencia creciente sostenida', trendCondition([100, 110, 121, 133, 146, 161]), 'PODER');

// Serie plana → la tendencia del periodo es estancamiento (EMERGENCIA), igual que la temprana.
check('tendencia plana', trendCondition([50, 51, 49, 50, 51, 50]), 'EMERGENCIA');

// CASO CLAVE (justifica la feature): serrucho que CAE en el periodo pero termina con un
// repunte final fuerte. La condición temprana (últimos 2 puntos) ve el repunte y NO marca
// caída; la tendencia (regresión) ve la pendiente negativa del periodo. Deben DIFERIR, y la
// tendencia NO debe ser positiva.
const repunte = [100, 70, 80, 55, 65, 40, 50, 75];
checkNot('serrucho+repunte: temprana no es caída', condition(repunte), 'PELIGRO');
checkNot('serrucho+repunte: tendencia ≠ temprana', trendCondition(repunte), condition(repunte));
checkNot('serrucho+repunte: tendencia no es crecimiento', trendCondition(repunte), 'NORMAL');
checkNot('serrucho+repunte: tendencia no es afluencia', trendCondition(repunte), 'AFLUENCIA');

// ============================================================================
// Fase 2 — Condición consolidada (analyzeConsolidated)
// ============================================================================

console.log('\nSelf-check motor — condición CONSOLIDADA (Fase 2):');

// Helper: construye N semanas con claves "2026-Wxx".
const wk = (i: number) => `2026-W${String(i + 1).padStart(2, '0')}`;

// CASO CLAVE (la queja del arquitecto): una métrica en PODER sostenido debe dar
// consolidado PODER, no EMERGENCIA. El consolidado mide NIVEL, no inclinación de totales.
const powerMetric: ConsolidatedMetricInput[] = [
  { metricKey: 'm1', points: [0, 1, 2, 3].map((i) => ({ week: wk(i), value: 100 + i * 8 })) },
];
check('una métrica en PODER → consolidado PODER',
  analysisEngine.analyzeConsolidated(powerMetric).condition, 'PODER');

// Regla dura: producción nula (todos 0) → INEXISTENCIA.
const zeros: ConsolidatedMetricInput[] = [
  { metricKey: 'm1', points: [{ week: wk(0), value: 0 }, { week: wk(1), value: 0 }] },
];
check('regla dura: producción 0 → INEXISTENCIA',
  analysisEngine.analyzeConsolidated(zeros).condition, 'INEXISTENCIA');

// Nivel: dos métricas, una PODER (10) y una EMERGENCIA (3) → promedio 6.5/10 = 0.65 →
// AFLUENCIA (umbral afluencia 0.65). Verifica que el consolidado promedia el nivel.
const mixed: ConsolidatedMetricInput[] = [
  { metricKey: 'm1', points: [0, 1, 2, 3].map((i) => ({ week: wk(i), value: 100 + i * 8 })) }, // PODER
  { metricKey: 'm2', points: [0, 1, 2, 3].map((i) => ({ week: wk(i), value: 100 })) },          // plano → EMERGENCIA
];
const consMixed = analysisEngine.analyzeConsolidated(mixed);
check('dos métricas: incluye ambas contribuciones',
  String(consMixed.metrics.length), '2');
checkNot('nivel mixto no es INEXISTENCIA', consMixed.condition, 'INEXISTENCIA');

// El motor solo cuenta las métricas que recibe (filtro producción/estudio/tracking es
// del backend). Con una sola métrica, una sola contribución.
const consOne = analysisEngine.analyzeConsolidated([powerMetric[0]]);
check('motor solo cuenta las métricas recibidas',
  String(consOne.metrics.length), '1');

// Umbrales de nivel configurables: una métrica NORMAL (ratio 0.5) da NORMAL con los
// umbrales por defecto (normal 0.45) pero EMERGENCIA con umbrales estrictos (normal 0.6).
const normalMetric: ConsolidatedMetricInput[] = [
  { metricKey: 'm1', points: [100, 130, 120, 140, 130, 150].map((value, i) => ({ week: wk(i), value })) },
];
const consDefaultLevels = analysisEngine.analyzeConsolidated(normalMetric);
check('nivel por defecto: métrica NORMAL → NORMAL', consDefaultLevels.condition, 'NORMAL');
const strictLevels = { poder: 0.95, afluencia: 0.8, normal: 0.6, emergencia: 0.3, peligro: 0.05 };
const consStrict = analysisEngine.analyzeConsolidated(normalMetric, { levels: strictLevels });
check('umbrales de nivel estrictos: misma métrica → EMERGENCIA', consStrict.condition, 'EMERGENCIA');

if (failures > 0) {
  console.error(`\n❌ Self-check falló: ${failures} caso(s).`);
  process.exit(1);
}
console.log('\n✅ Self-check del motor OK.');
