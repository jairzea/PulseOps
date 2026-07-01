/**
 * Self-check ejecutable de `currentWeekWindow` (sin framework).
 * Corre con: npx ts-node src/repo-integration/week-range.selfcheck.ts
 *
 * Verifica que la ventana sea jueves 00:00 GMT-5 → jueves siguiente 00:00 GMT-5, dure 7 días,
 * y que un `ref` cualquiera de la semana caiga dentro del rango [since, until).
 */
import { currentWeekWindow } from './week-range';
import * as assert from 'assert';

const GMT5_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// 1) Miércoles 2026-07-01 18:00 GMT-5 (23:00 UTC) → semana que arranca el jueves 2026-06-25.
const wed = new Date('2026-07-01T23:00:00.000Z');
const w = currentWeekWindow(wed);
const since = new Date(w.since);
const until = new Date(w.until);

// El inicio en hora GMT-5 debe ser jueves a medianoche.
const sinceLocal = new Date(since.getTime() - GMT5_MS);
assert.strictEqual(sinceLocal.getUTCDay(), 4, 'el inicio debe ser jueves (GMT-5)');
assert.strictEqual(sinceLocal.getUTCHours(), 0, 'el inicio debe ser medianoche GMT-5');

// 2) Duración exacta de 7 días.
assert.strictEqual(until.getTime() - since.getTime(), 7 * DAY_MS, 'la ventana dura 7 días');

// 3) El ref cae dentro del rango.
assert.ok(wed.getTime() >= since.getTime(), 'ref >= since');
assert.ok(wed.getTime() < until.getTime(), 'ref < until');

// 4) Un jueves a las 00:30 GMT-5 inicia su propia semana (no la anterior).
const thu = new Date('2026-06-25T05:30:00.000Z'); // 00:30 GMT-5
const wt = currentWeekWindow(thu);
assert.strictEqual(
  new Date(wt.since).getTime(),
  thu.getTime() - 30 * 60 * 1000,
  'jueves 00:30 GMT-5 pertenece a la semana que arranca ese mismo jueves',
);

console.log('week-range.selfcheck OK ✓');
