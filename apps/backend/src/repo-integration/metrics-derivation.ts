/**
 * Derivación pura de métricas de desarrollador a partir de conteos brutos de Git.
 *
 * Sin I/O: recibe los conteos que produce el analizador (gross/deletions/self-churn/...)
 * y devuelve las métricas finales del framework. Aislado para poder verificarlo con asserts.
 *
 * Métricas principales (cuentan para producción): NUI, Development Efficiency.
 * Complementarias (seguimiento): UIP/d, Self-Churn Rate, Fix Ratio (freq/vol), Commits/día.
 */

export interface RawGitCounts {
  grossInsertions: number; // suma de inserciones por commit (Método B)
  totalDeletions: number; // suma de deletions por commit
  selfChurn: number; // líneas eliminadas cuyo origen está en el scope (blame)
  totalCommits: number; // commits del autor en el rango (excl. qa()/merges)
  correctiveCommits: number; // commits fix() + en ramas bugfix/
  correctiveInsertions: number; // inserciones de commits correctivos
  workingDays: number; // días calendario con al menos un commit
}

export interface DerivedDevMetrics {
  // Principales
  nui: number; // Net Useful Insertions = gross - selfChurn
  devEfficiency: number; // (netDelta / gross) * 100
  // Complementarias
  uipPerDay: number; // nui / workingDays
  selfChurnRate: number; // selfChurn / gross * 100
  fixRatioFreq: number; // correctiveCommits / totalCommits * 100
  fixRatioVol: number; // correctiveInsertions / gross * 100
  commitsPerDay: number; // totalCommits / workingDays
}

/** Redondea a 2 decimales para porcentajes/ratios estables. */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** División segura: 0 si el denominador es 0 (evita NaN/Infinity). */
const safeDiv = (num: number, den: number): number => (den > 0 ? num / den : 0);

export function deriveDevMetrics(counts: RawGitCounts): DerivedDevMetrics {
  const { grossInsertions, totalDeletions, selfChurn } = counts;

  const nui = grossInsertions - selfChurn;
  const netDelta = grossInsertions - totalDeletions;

  return {
    nui,
    devEfficiency: round2(safeDiv(netDelta, grossInsertions) * 100),
    uipPerDay: round2(safeDiv(nui, counts.workingDays)),
    selfChurnRate: round2(safeDiv(selfChurn, grossInsertions) * 100),
    fixRatioFreq: round2(safeDiv(counts.correctiveCommits, counts.totalCommits) * 100),
    fixRatioVol: round2(safeDiv(counts.correctiveInsertions, grossInsertions) * 100),
    commitsPerDay: round2(safeDiv(counts.totalCommits, counts.workingDays)),
  };
}
