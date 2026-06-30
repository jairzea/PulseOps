import { Injectable } from '@nestjs/common';
import {
  RepoAccount,
  RepoProvider,
  RepoRef,
  WeekRange,
} from './providers/repo-provider.interface';
import { sumValidatedAcs } from './qa-parsing';

/** Métricas crudas de QA para una semana. */
export interface RawQaCounts {
  /** Criterios de aceptación validados (principal): suma de `N/N ACs pass`. */
  validatedAcs: number;
}

/**
 * Analizador de QA (API, sin clonar). v1 calcula solo "criterios validados": suma de los
 * `N/N ACs pass` que aparezcan en el subject de los commits de la persona QA en la semana
 * (cubre tanto el subject del merge como el commit `qa(...)`, según la convención observada).
 *
 * ponytail: cuenta cualquier subject de la QA en la semana que case `N/N ACs pass`. Ceiling:
 * si los mismos ACs aparecen en el commit `qa()` y en su merge se contarían dos veces;
 * upgrade path = deduplicar por rama/PR. "Automatizados" (docs e2e/) → v2.
 */
@Injectable()
export class QaAnalyzer {
  async computeCounts(
    provider: RepoProvider,
    repos: RepoRef[],
    identities: RepoAccount[],
    week: WeekRange,
  ): Promise<RawQaCounts> {
    const subjects: string[] = [];
    for (const repo of repos) {
      const commits = await provider.commitsInRange(repo, identities, week);
      for (const c of commits) {
        subjects.push(c.message.split('\n')[0]);
      }
    }
    return { validatedAcs: sumValidatedAcs(subjects) };
  }
}
