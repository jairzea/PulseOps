import { Injectable } from '@nestjs/common';
import {
  RepoAccount,
  RepoProvider,
  RepoRef,
  WeekRange,
} from './providers/repo-provider.interface';
import { RawGitCounts } from './metrics-derivation';

/** Patrones excluidos de los conteos (generados, deps, binarios, compilados). */
const EXCLUDE = /(package-lock\.json|node_modules\/|\.sst\/|dist\/|\.png$|\.jpg$|\.ico$|\.woff$)/;

/** Identifica commits correctivos por convención de mensaje. */
const isCorrective = (message: string): boolean =>
  /^fix\(/.test(message) || /^fix:/.test(message);

/**
 * Construye los conteos brutos (RawGitCounts) de un developer/arquitecto para una semana,
 * usando solo la API del proveedor (sin clonar). El self-churn se calcula cruzando las
 * líneas borradas de cada commit con el blame del estado padre.
 */
@Injectable()
export class DevAnalyzer {
  async computeCounts(
    provider: RepoProvider,
    repos: RepoRef[],
    identities: RepoAccount[],
    week: WeekRange,
  ): Promise<RawGitCounts> {
    const emails = new Set(
      identities.map((i) => i.email?.toLowerCase()).filter(Boolean) as string[],
    );
    const logins = new Set(
      identities.map((i) => i.username?.toLowerCase()).filter(Boolean) as string[],
    );
    const inScope = (email?: string, login?: string): boolean =>
      (!!email && emails.has(email.toLowerCase())) ||
      (!!login && logins.has(login.toLowerCase()));

    let grossInsertions = 0;
    let totalDeletions = 0;
    let selfChurn = 0;
    let totalCommits = 0;
    let correctiveCommits = 0;
    let correctiveInsertions = 0;
    const days = new Set<string>();

    for (const repo of repos) {
      // Aislar por repo: uno vacío/inaccesible (409/404/etc.) no debe tumbar toda la sync.
      let commits: Awaited<ReturnType<typeof provider.commitsInRange>>;
      try {
        commits = await provider.commitsInRange(repo, identities, week);
      } catch {
        continue; // ponytail: se salta el repo problemático; ceiling = no reporta cuáles.
      }
      for (const c of commits) {
        if (c.isMerge) continue; // merges no cuentan (framework)
        if (/^qa\(/.test(c.message)) continue; // qa() no es trabajo de dev

        grossInsertions += c.additions;
        totalDeletions += c.deletions;
        totalCommits += 1;
        days.add(c.authoredDate.slice(0, 10)); // día calendario (YYYY-MM-DD)
        if (isCorrective(c.message)) {
          correctiveCommits += 1;
          correctiveInsertions += c.additions;
        }

        // Self-churn: líneas borradas por este commit cuyo origen está en el scope.
        if (c.deletions > 0) {
          try {
            selfChurn += await this.selfChurnForCommit(provider, repo, c.sha, inScope);
          } catch {
            // blame de un archivo puede fallar (renombrado, binario); no cuenta churn.
          }
        }
      }
    }

    return {
      grossInsertions,
      totalDeletions,
      selfChurn,
      totalCommits,
      correctiveCommits,
      correctiveInsertions,
      workingDays: days.size,
    };
  }

  /**
   * Self-churn de un commit: por cada archivo con líneas borradas, consulta el blame del
   * estado padre (`sha^`) y cuenta las líneas cuyo commit de origen es del mismo scope.
   *
   * ponytail: una query de blame por archivo tocado. v1 no pagina blame gigantes; si un
   * archivo es enorme, el rango cubre todo igual. Ceiling: rate limit → limitar a archivos
   * tocados (ya se hace) y cachear por (repo, sha^, path).
   */
  private async selfChurnForCommit(
    provider: RepoProvider,
    repo: RepoRef,
    sha: string,
    inScope: (email?: string, login?: string) => boolean,
  ): Promise<number> {
    const deleted = await provider.deletedLinesForCommit(repo, sha);
    if (deleted.length === 0) return 0;

    // Agrupar líneas borradas por archivo.
    const byFile = new Map<string, number[]>();
    for (const d of deleted) {
      if (EXCLUDE.test(d.path)) continue;
      const arr = byFile.get(d.path) ?? [];
      arr.push(d.line);
      byFile.set(d.path, arr);
    }

    let churn = 0;
    const parentRef = `${sha}^`;
    for (const [path, lines] of byFile) {
      const ranges = await provider.blame(repo, parentRef, path);
      for (const line of lines) {
        const range = ranges.find(
          (r) => line >= r.startingLine && line <= r.endingLine,
        );
        if (range && inScope(range.originAuthorEmail, range.originAuthorLogin)) {
          churn += 1;
        }
      }
    }
    return churn;
  }
}
