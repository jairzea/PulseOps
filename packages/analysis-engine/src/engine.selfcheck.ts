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
import type { MetricSeries } from '@pulseops/shared-types';

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

if (failures > 0) {
  console.error(`\n❌ Self-check falló: ${failures} caso(s).`);
  process.exit(1);
}
console.log('\n✅ Self-check del motor OK.');
