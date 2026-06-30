/**
 * Parsing puro de criterios de aceptación validados desde el subject de un merge commit.
 *
 * Convención confirmada con QA (2026-06-30): el título del merge trae `N/N ACs pass`
 * (ej. "qa(e2e): update checklist — 26/26 ACs pass"). El numerador es la cantidad de ACs
 * que pasaron. Se cuentan en la semana del merge.
 */

export interface MergeAcResult {
  passed: number;
  total: number;
}

/**
 * Extrae `passed/total` del patrón `N/N ACs pass` (case-insensitive, tolera espacios).
 * Devuelve null si el mensaje no sigue la convención.
 */
export function parseAcsFromMergeSubject(subject: string): MergeAcResult | null {
  // Toma la primera línea (subject) y busca "<n>/<m> ACs pass".
  const firstLine = subject.split('\n')[0];
  const m = firstLine.match(/(\d+)\s*\/\s*(\d+)\s*ACs?\s*pass/i);
  if (!m) return null;
  const passed = parseInt(m[1], 10);
  const total = parseInt(m[2], 10);
  if (Number.isNaN(passed) || Number.isNaN(total)) return null;
  return { passed, total };
}

/**
 * Suma los ACs validados de una lista de subjects de merge commits de la semana.
 * Ignora los que no siguen la convención.
 */
export function sumValidatedAcs(mergeSubjects: string[]): number {
  return mergeSubjects.reduce((sum, s) => {
    const r = parseAcsFromMergeSubject(s);
    return sum + (r ? r.passed : 0);
  }, 0);
}
