/**
 * Self-check de parseAcsFromMergeSubject / sumValidatedAcs (sin framework).
 * Ejecutar: npx ts-node src/repo-integration/qa-parsing.selfcheck.ts (desde apps/backend)
 */
import assert from 'node:assert';
import { parseAcsFromMergeSubject, sumValidatedAcs } from './qa-parsing';

let failures = 0;
const check = (name: string, cond: boolean) => {
  if (cond) console.log(`  ✓ ${name}`);
  else {
    failures++;
    console.error(`  ✗ ${name}`);
  }
};

console.log('Self-check QA parsing:');

// Ejemplo real del push del QA.
const r1 = parseAcsFromMergeSubject('qa(e2e): update checklist — 26/26 ACs pass');
check('parsea 26/26 → passed 26', r1?.passed === 26 && r1?.total === 26);

// Parciales y variaciones de formato.
check('parcial 18/26', parseAcsFromMergeSubject('feat: x — 18/26 ACs pass')?.passed === 18);
check('singular "AC pass"', parseAcsFromMergeSubject('1/1 AC pass')?.passed === 1);
check('espacios y mayúsculas', parseAcsFromMergeSubject('9 / 9  ACS PASS')?.passed === 9);

// No-match → null (no rompe).
check('sin convención → null', parseAcsFromMergeSubject('chore: bump deps') === null);
check('solo usa la primera línea', parseAcsFromMergeSubject('título sin acs\n5/5 ACs pass') === null);

// Suma sobre varios merges de la semana (ignora los que no aplican).
const total = sumValidatedAcs([
  'qa(e2e): 26/26 ACs pass',
  'fix: algo 3/4 ACs pass',
  'chore: nada que ver',
]);
check('suma semanal = 26 + 3 = 29', total === 29);

if (failures > 0) {
  console.error(`\n❌ Self-check falló: ${failures} caso(s).`);
  process.exit(1);
}
console.log('\n✅ Self-check QA parsing OK.');
