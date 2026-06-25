// Verificación ejecutable del helper `tid` (sin framework).
// Cubre las Propiedades 1 y 2 del diseño con asserts y node:assert.
// Ejecutable como script TS (p. ej. `npx tsx src/utils/testId.test.ts` desde apps/frontend).
import assert from 'node:assert/strict';
import { tid } from './testId';

// Entradas representativas + casos límite (espacios, mayúsculas, caracteres especiales, vacíos).
const cases: string[][] = [
  ['login', 'email'],
  ['resources', 'create'],
  ['resources', 'row', 'abc-123', 'edit'],
  ['Dashboard', 'Condition'],
  ['  with spaces  ', 'mixed CASE'],
  ['weird@#$chars!', 'a.b.c'],
  ['under_score', 'dash-already'],
  ['único', 'café'], // los caracteres fuera de [a-zA-Z0-9-_] se descartan
  [''], // segmento vacío => se filtra
  ['', 'metric'],
];

const KEBAB = /^[a-z0-9-_]+$/;

// Feature: e2e-regression-suite, Property 1: Forma del testId — empieza por `cy-`,
// kebab-case ([a-z0-9-_], sin espacios ni mayúsculas) y contiene cada segmento normalizado.
for (const segments of cases) {
  const id = tid(...segments);
  const normalized = segments.map((s) =>
    s.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase(),
  );
  const nonEmpty = normalized.filter(Boolean);

  if (nonEmpty.length === 0) {
    // Sin segmentos efectivos el id colapsa al prefijo pelado.
    assert.equal(id, 'cy', `id sin segmentos efectivos debe ser 'cy' (segments=${JSON.stringify(segments)})`);
  } else {
    assert.ok(id.startsWith('cy-'), `id debe empezar por 'cy-': ${id}`);
    assert.match(id, KEBAB, `id debe ser kebab-case sin espacios ni mayúsculas: ${id}`);
    assert.ok(!/\s/.test(id), `id no debe contener espacios: ${id}`);
    assert.equal(id, id.toLowerCase(), `id debe estar en minúsculas: ${id}`);
    for (const seg of nonEmpty) {
      assert.ok(id.includes(seg), `id '${id}' debe contener el segmento normalizado '${seg}'`);
    }
  }
}

// Feature: e2e-regression-suite, Property 2: Determinismo del testId — invocaciones
// repetidas con los mismos segmentos producen exactamente el mismo string.
for (const segments of cases) {
  const a = tid(...segments);
  const b = tid(...segments);
  const c = tid(...segments);
  assert.equal(a, b, `tid no determinista para ${JSON.stringify(segments)}: ${a} != ${b}`);
  assert.equal(b, c, `tid no determinista para ${JSON.stringify(segments)}: ${b} != ${c}`);
}

console.log('testId.test.ts: todas las verificaciones (Property 1 y Property 2) pasaron.');
