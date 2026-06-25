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

let failures = 0;
const check = (name: string, actual: string, expected: string) => {
  try {
    assert.strictEqual(actual, expected);
    console.log(`  ✓ ${name} → ${actual}`);
  } catch {
    failures++;
    console.error(`  ✗ ${name}: esperado ${expected}, obtenido ${actual}`);
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

if (failures > 0) {
  console.error(`\n❌ Self-check falló: ${failures} caso(s).`);
  process.exit(1);
}
console.log('\n✅ Self-check del motor OK.');
