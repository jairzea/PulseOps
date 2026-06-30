/**
 * Repo Integration API — integración con repositorios (GitHub primero).
 * Asociación persona↔cuenta, estado del proveedor y sincronización a demanda.
 */
import { httpClient } from './httpClient';

export type RepoProviderName = 'github' | 'bitbucket';

export interface RepoRef {
  id: string;
  owner: string;
  name: string;
}

export interface RepoIdentity {
  provider: RepoProviderName;
  username?: string;
  email?: string;
  confirmed: boolean;
}

export interface RepoScope {
  allRepos: boolean;
  repoIds?: string[];
}

export interface PersonRepoProfile {
  resourceId: string;
  name: string;
  email: string;
  roleType: string;
  identities: RepoIdentity[];
  scope: RepoScope;
}

export interface RepoConnection {
  id: string;
  provider: RepoProviderName;
  installationId: number;
  account: string;
  isActive: boolean;
}

export interface IntegrationStatus {
  provider: RepoProviderName;
  mode: 'app' | 'pat' | 'none';
  configured: boolean;
  repos: RepoRef[];
  connections: RepoConnection[];
}

export interface SyncItemResult {
  resourceId: string;
  name: string;
  status: 'ok' | 'skipped' | 'error';
  records?: number;
  detail?: string;
}

export interface SyncRunResult {
  startedAt: string;
  finishedAt: string;
  trigger: 'scheduled' | 'manual';
  week: string;
  items: SyncItemResult[];
}

export interface MatchSuggestion {
  account: { provider: RepoProviderName; username: string; email?: string };
  suggestedResourceId: string | null;
  suggestedName: string | null;
}

class RepoIntegrationApiImpl {
  private readonly base = '/repo-integration';

  status(): Promise<IntegrationStatus> {
    return httpClient.get<IntegrationStatus>(`${this.base}/status`);
  }

  installUrl(): Promise<{ url: string | null }> {
    return httpClient.get<{ url: string | null }>(`${this.base}/install-url`);
  }

  connect(installationId: number): Promise<RepoConnection> {
    return httpClient.post<RepoConnection>(`${this.base}/connections`, { installationId });
  }

  disconnect(installationId: number): Promise<void> {
    return httpClient.delete<void>(`${this.base}/connections/${installationId}`);
  }

  getProfile(resourceId: string): Promise<PersonRepoProfile> {
    return httpClient.get<PersonRepoProfile>(`${this.base}/identities/${resourceId}`);
  }

  setIdentities(
    resourceId: string,
    payload: { identities: RepoIdentity[]; scope?: RepoScope },
  ): Promise<PersonRepoProfile> {
    return httpClient.put<PersonRepoProfile>(
      `${this.base}/identities/${resourceId}`,
      payload,
    );
  }

  clearIdentities(resourceId: string, provider?: RepoProviderName): Promise<PersonRepoProfile> {
    const q = provider ? `?provider=${provider}` : '';
    return httpClient.delete<PersonRepoProfile>(`${this.base}/identities/${resourceId}${q}`);
  }

  suggestMatches(
    accounts: Array<{ provider: RepoProviderName; username: string; email?: string }>,
  ): Promise<MatchSuggestion[]> {
    return httpClient.post<MatchSuggestion[]>(`${this.base}/suggest-matches`, { accounts });
  }

  verifyUser(login: string): Promise<{
    login: string;
    name: string | null;
    avatarUrl: string;
    htmlUrl: string;
  } | null> {
    return httpClient.get(`${this.base}/verify-user/${encodeURIComponent(login)}`);
  }

  sync(): Promise<SyncRunResult> {
    return httpClient.post<SyncRunResult>(`${this.base}/sync`);
  }

  lastRun(): Promise<SyncRunResult | null> {
    return httpClient.get<SyncRunResult | null>(`${this.base}/runs/last`);
  }
}

export const repoIntegrationApi = new RepoIntegrationApiImpl();
