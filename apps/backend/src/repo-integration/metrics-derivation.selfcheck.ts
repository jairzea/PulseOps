/**
 * Self-check de deriveDevMetrics (sin framework). Verifica las fórmulas contra los
 * ejemplos del documento de estadísticas del desarrollador.
 *
 * Ejecutar: npx ts-node src/repo-integration/metrics-derivation.selfcheck.ts (desde apps/backend)
 */
import assert from 'node:assert';
import { deriveDevMetrics } from './metrics-derivation';

let failures = 0;
const check = (name: string, actual: number, expected: number) => {
  if (actual === expected) {
    console.log(`  ✓ ${name} → ${actual}`);
  } else {
    failures++;
    console.error(`  ✗ ${name}: esperado ${expected}, obtenido ${actual}`);
  }
};

console.log('Self-check deriveDevMetrics:');

// Ejemplo del documento: 12000 gross, 2000 self-churn → NUI 10000.
// Y 10000 ins, 3000 del → net delta 7000 → efficiency 70%.
// Combinamos: gross 12000, deletions 5000 (net delta 7000), selfChurn 2000.
const m = deriveDevMetrics({
  grossInsertions: 12000,
  totalDeletions: 5000,
  selfChurn: 2000,
  totalCommits: 40,
  correctiveCommits: 4,
  correctiveInsertions: 600,
  workingDays: 5,
});

check('NUI = gross - selfChurn', m.nui, 10000);
check('Efficiency = netDelta/gross*100', m.devEfficiency, round(7000 / 12000 * 100));
check('UIP/d = nui/workingDays', m.uipPerDay, 2000);
check('Self-Churn Rate', m.selfChurnRate, round(2000 / 12000 * 100));
check('Fix Ratio freq', m.fixRatioFreq, 10);
check('Fix Ratio vol', m.fixRatioVol, round(600 / 12000 * 100));
check('Commits/día', m.commitsPerDay, 8);

// Caso borde: sin producción (todo 0) no debe dar NaN/Infinity.
const z = deriveDevMetrics({
  grossInsertions: 0,
  totalDeletions: 0,
  selfChurn: 0,
  totalCommits: 0,
  correctiveCommits: 0,
  correctiveInsertions: 0,
  workingDays: 0,
});
check('cero: NUI', z.nui, 0);
check('cero: efficiency', z.devEfficiency, 0);
check('cero: uip/d', z.uipPerDay, 0);

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

if (failures > 0) {
  console.error(`\n❌ Self-check falló: ${failures} caso(s).`);
  process.exit(1);
}
console.log('\n✅ Self-check de derivación OK.');
