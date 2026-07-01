import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '../../common/exceptions/app.exception';
import { GithubAuth } from './github-auth';
import {
  BlameRange,
  CommitMeta,
  DeletedLine,
  RepoAccount,
  RepoProvider,
  RepoRef,
  WeekRange,
} from './repo-provider.interface';

/**
 * Proveedor GitHub vía API (REST + GraphQL). NO clona repos.
 *
 * - Token de organización desde env `GITHUB_TOKEN` (solo lectura: repo/metadata).
 * - REST: repos, commits, diffs. GraphQL: blame (origen de línea para self-churn).
 *
 * ponytail: usa `fetch` nativo de Node 20 (sin dependencia de cliente HTTP). Sin reintentos
 * sofisticados; un retry simple ante 202 de stats. Ceiling: rate limit en repos grandes →
 * paginar y limitar el blame a archivos tocados.
 */
@Injectable()
export class GithubProvider implements RepoProvider {
  readonly name = 'github' as const;
  private readonly api = 'https://api.github.com';
  private readonly graphql = 'https://api.github.com/graphql';

  constructor(
    private readonly config: ConfigService,
    private readonly auth: GithubAuth,
  ) {}

  isConfigured(): boolean {
    return this.auth.isConfigured();
  }

  /** Modo de autenticación activo (para la UI). */
  authMode(): 'app' | 'pat' | 'none' {
    return this.auth.mode();
  }

  private async authHeader(installationId?: number): Promise<string> {
    return `Bearer ${await this.auth.accessToken(installationId)}`;
  }

  private async rest<T>(path: string, installationId?: number): Promise<T> {
    const res = await fetch(`${this.api}${path}`, {
      headers: {
        Authorization: await this.authHeader(installationId),
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) {
      throw new ServiceUnavailableException('Error consultando la API de GitHub.', {
        status: res.status,
        path,
      });
    }
    return res.json() as Promise<T>;
  }

  /** REST autenticado como la App (App JWT), para endpoints de nivel App como /app/installations. */
  private async restAsApp<T>(path: string): Promise<T> {
    const res = await fetch(`${this.api}${path}`, {
      headers: {
        Authorization: `Bearer ${this.auth.appJwt()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) {
      throw new ServiceUnavailableException('Error consultando la API de GitHub (App).', {
        status: res.status,
        path,
      });
    }
    return res.json() as Promise<T>;
  }

  private async gql<T>(
    query: string,
    variables: Record<string, unknown>,
    installationId?: number,
  ): Promise<T> {
    const res = await fetch(this.graphql, {
      method: 'POST',
      headers: {
        Authorization: await this.authHeader(installationId),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException('Error consultando GraphQL de GitHub.', {
        status: res.status,
      });
    }
    const body = (await res.json()) as { data?: T; errors?: unknown };
    if (body.errors) {
      throw new ServiceUnavailableException('GraphQL de GitHub devolvió errores.', {
        errors: body.errors,
      });
    }
    return body.data as T;
  }

  private orgRepoOwner(): string {
    return this.config.get<string>('GITHUB_ORG') ?? '';
  }

  /** Instalaciones de la GitHub App (modo App). Cada una expone sus repos. */
  async listInstallations(): Promise<Array<{ id: number; account: string }>> {
    const list = await this.restAsApp<
      Array<{ id: number; account?: { login?: string } }>
    >('/app/installations?per_page=100');
    return list.map((i) => ({ id: i.id, account: i.account?.login ?? '' }));
  }

  async listRepositories(): Promise<RepoRef[]> {
    if (this.auth.mode() === 'app') {
      // En modo App: por cada instalación, sus repos accesibles (token de instalación).
      const installations = await this.listInstallations();
      const out: RepoRef[] = [];
      for (const inst of installations) {
        const body = await this.rest<{
          repositories: Array<{ name: string; owner: { login: string } }>;
        }>('/installation/repositories?per_page=100', inst.id);
        for (const r of body.repositories ?? []) {
          out.push({
            id: `${r.owner.login}/${r.name}`,
            owner: r.owner.login,
            name: r.name,
            installationId: inst.id,
          });
        }
      }
      return out;
    }

    // Modo PAT: repos de la org configurada o del usuario del token.
    const org = this.orgRepoOwner();
    const path = org ? `/orgs/${org}/repos?per_page=100` : `/user/repos?per_page=100`;
    const repos = await this.rest<Array<{ name: string; owner: { login: string } }>>(path);
    return repos.map((r) => ({
      id: `${r.owner.login}/${r.name}`,
      owner: r.owner.login,
      name: r.name,
    }));
  }

  async listContributors(repo: RepoRef): Promise<RepoAccount[]> {
    const contributors = await this.rest<Array<{ login: string }>>(
      `/repos/${repo.owner}/${repo.name}/contributors?per_page=100`,
      repo.installationId,
    );
    return contributors.map((c) => ({ provider: this.name, username: c.login }));
  }

  /**
   * Verifica que un login de GitHub exista y devuelve su identidad canónica (login exacto,
   * nombre, avatar). Sirve para que el admin confirme la asociación viendo la persona real,
   * en vez de guardar texto a ciegas. `null` si no existe (404).
   */
  async verifyUser(
    login: string,
  ): Promise<{ login: string; name: string | null; avatarUrl: string; htmlUrl: string } | null> {
    try {
      const path = `/users/${encodeURIComponent(login)}`;
      // /users/{login} necesita token de instalación (App) o PAT — NO el App JWT.
      // En modo App tomamos la primera instalación disponible para acuñar el token.
      let installationId: number | undefined;
      if (this.auth.mode() === 'app') {
        const installs = await this.listInstallations();
        installationId = installs[0]?.id;
        if (!installationId) return null;
      }
      const u = await this.rest<{
        login: string;
        name: string | null;
        avatar_url: string;
        html_url: string;
        type: string;
      }>(path, installationId);
      if (u.type !== 'User') return null; // descarta orgs/bots
      return {
        login: u.login,
        name: u.name,
        avatarUrl: u.avatar_url,
        htmlUrl: u.html_url,
      };
    } catch {
      return null; // 404 u otro error → no verificado
    }
  }

  async commitsInRange(
    repo: RepoRef,
    identities: RepoAccount[],
    week: WeekRange,
  ): Promise<CommitMeta[]> {
    const logins = new Set(
      identities.map((i) => i.username?.toLowerCase()).filter(Boolean) as string[],
    );
    const emails = new Set(
      identities.map((i) => i.email?.toLowerCase()).filter(Boolean) as string[],
    );

    const list = await this.rest<
      Array<{
        sha: string;
        commit: { message: string; author?: { email?: string; date?: string } };
        author?: { login?: string } | null;
        parents: unknown[];
      }>
    >(
      `/repos/${repo.owner}/${repo.name}/commits?since=${encodeURIComponent(week.since)}&until=${encodeURIComponent(week.until)}&per_page=100`,
      repo.installationId,
    );

    // Filtrar por identidad (login o email) y enriquecer additions/deletions por commit.
    const out: CommitMeta[] = [];
    for (const c of list) {
      const login = c.author?.login?.toLowerCase();
      const email = c.commit.author?.email?.toLowerCase();
      const mine =
        (login && logins.has(login)) || (email && emails.has(email));
      if (!mine) continue;

      const detail = await this.rest<{
        stats?: { additions: number; deletions: number };
      }>(`/repos/${repo.owner}/${repo.name}/commits/${c.sha}`, repo.installationId);

      out.push({
        sha: c.sha,
        authorLogin: c.author?.login,
        authorEmail: c.commit.author?.email,
        authoredDate: c.commit.author?.date ?? week.since,
        message: c.commit.message,
        isMerge: (c.parents?.length ?? 0) > 1,
        additions: detail.stats?.additions ?? 0,
        deletions: detail.stats?.deletions ?? 0,
      });
    }
    return out;
  }

  async deletedLinesForCommit(repo: RepoRef, sha: string): Promise<DeletedLine[]> {
    const detail = await this.rest<{
      files?: Array<{ filename: string; patch?: string }>;
    }>(`/repos/${repo.owner}/${repo.name}/commits/${sha}`, repo.installationId);

    const deleted: DeletedLine[] = [];
    for (const f of detail.files ?? []) {
      if (!f.patch) continue;
      // Parsear el unified diff: las líneas que empiezan con '-' (no '---') son borrados.
      // El número de línea en el archivo PADRE viene del hunk header @@ -a,b +c,d @@.
      let oldLine = 0;
      for (const row of f.patch.split('\n')) {
        const hunk = row.match(/^@@ -(\d+)(?:,\d+)? \+\d+/);
        if (hunk) {
          oldLine = parseInt(hunk[1], 10);
          continue;
        }
        if (row.startsWith('-') && !row.startsWith('---')) {
          deleted.push({ path: f.filename, line: oldLine });
          oldLine++;
        } else if (!row.startsWith('+')) {
          oldLine++;
        }
      }
    }
    return deleted;
  }

  async blame(repo: RepoRef, ref: string, path: string): Promise<BlameRange[]> {
    const query = `
      query($owner:String!,$name:String!,$ref:String!,$path:String!){
        repository(owner:$owner,name:$name){
          object(expression:$ref){
            ... on Commit {
              blame(path:$path){
                ranges{ startingLine endingLine commit{ oid author{ email user{ login } } } }
              }
            }
          }
        }
      }`;
    const data = await this.gql<{
      repository?: {
        object?: {
          blame?: {
            ranges: Array<{
              startingLine: number;
              endingLine: number;
              commit: { oid: string; author?: { email?: string; user?: { login?: string } } };
            }>;
          };
        };
      };
    }>(query, { owner: repo.owner, name: repo.name, ref, path }, repo.installationId);

    const ranges = data.repository?.object?.blame?.ranges ?? [];
    return ranges.map((r) => ({
      startingLine: r.startingLine,
      endingLine: r.endingLine,
      originSha: r.commit.oid,
      originAuthorEmail: r.commit.author?.email,
      originAuthorLogin: r.commit.author?.user?.login,
    }));
  }
}
