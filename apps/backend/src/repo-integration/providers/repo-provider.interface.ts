/**
 * Contrato de un proveedor de repositorios (GitHub primero, Bitbucket después).
 * Todo se obtiene vía API — NO se clona el repositorio.
 */

export type RepoProviderName = 'github' | 'bitbucket';

export interface RepoRef {
  /** Identificador estable del repo (ej. "owner/name"). */
  id: string;
  owner: string;
  name: string;
}

export interface RepoAccount {
  provider: RepoProviderName;
  username: string;
  email?: string;
}

export interface WeekRange {
  /** ISO date inclusivo (inicio de semana, GMT-5 → se pasa a UTC en la query). */
  since: string;
  /** ISO date exclusivo (fin de semana). */
  until: string;
}

export interface CommitMeta {
  sha: string;
  authorLogin?: string;
  authorEmail?: string;
  /** Fecha de autoría ISO 8601 (para contar días trabajados). */
  authoredDate: string;
  message: string;
  isMerge: boolean;
  additions: number;
  deletions: number;
}

/** Una línea borrada por un commit, con su path. */
export interface DeletedLine {
  path: string;
  line: number; // número de línea en el archivo padre
}

/** Rango de blame: líneas [start..end] originadas por el commit `originSha` (autor). */
export interface BlameRange {
  startingLine: number;
  endingLine: number;
  originSha: string;
  originAuthorEmail?: string;
  originAuthorLogin?: string;
}

export interface RepoProvider {
  readonly name: RepoProviderName;

  /** Repos accesibles con las credenciales configuradas. */
  listRepositories(): Promise<RepoRef[]>;

  /** Cuentas/contribuidores de un repo (para sugerir match por email). */
  listContributors(repo: RepoRef): Promise<RepoAccount[]>;

  /** Commits de un autor (por login o email) en el rango. */
  commitsInRange(
    repo: RepoRef,
    identities: RepoAccount[],
    week: WeekRange,
  ): Promise<CommitMeta[]>;

  /** Líneas que borró un commit, por archivo (para cruzar con blame). */
  deletedLinesForCommit(repo: RepoRef, sha: string): Promise<DeletedLine[]>;

  /** Blame de un path en un ref (estado padre), para saber el origen de cada línea. */
  blame(repo: RepoRef, ref: string, path: string): Promise<BlameRange[]>;
}
