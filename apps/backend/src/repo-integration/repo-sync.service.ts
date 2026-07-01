import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RecordsService } from '../records/records.service';
import { GithubProvider } from './providers/github.provider';
import { RepoAccount, RepoProvider, RepoRef } from './providers/repo-provider.interface';
import { DevAnalyzer } from './dev-analyzer';
import { QaAnalyzer } from './qa-analyzer';
import { deriveDevMetrics } from './metrics-derivation';
import { currentWeekWindow, WeekWindow } from './week-range';

export type SyncTrigger = 'scheduled' | 'manual';

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
  trigger: SyncTrigger;
  week: string;
  items: SyncItemResult[];
}

/**
 * Orquesta la sincronización: por cada persona vinculada, resuelve sus repos según el scope,
 * corre el analizador de su rol (Dev o QA), deriva las métricas y las persiste como
 * `MetricRecord` (idempotente por semana vía upsert). No clona: todo por API.
 *
 * ponytail: procesa personas en serie con `await` para no reventar el rate limit de la API.
 * Ceiling: con muchos devs/repos la corrida es lenta; upgrade path = colas/concurrencia
 * controlada por repo. El último run se guarda en memoria (no en colección) — suficiente para
 * v1; persistir en `repo-sync-runs` si se requiere histórico.
 */
@Injectable()
export class RepoSyncService {
  private readonly logger = new Logger(RepoSyncService.name);
  private lastRun: SyncRunResult | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly recordsService: RecordsService,
    private readonly github: GithubProvider,
    private readonly devAnalyzer: DevAnalyzer,
    private readonly qaAnalyzer: QaAnalyzer,
  ) {}

  getLastRun(): SyncRunResult | null {
    return this.lastRun;
  }

  async runSync(opts: { trigger: SyncTrigger }): Promise<SyncRunResult> {
    const startedAt = new Date().toISOString();
    const window = currentWeekWindow();
    const items: SyncItemResult[] = [];

    const provider = this.github; // único proveedor en v1
    let repos: RepoRef[] = [];
    try {
      repos = await provider.listRepositories();
    } catch (e) {
      this.logger.error(`No se pudieron listar repos: ${(e as Error).message}`);
    }

    const users = await this.usersService.findAll(false);
    for (const user of users) {
      // Cualquier usuario activo con identidad confirmada se sincroniza (dev/arquitecto
      // también se miden, no solo role USER).
      const rp: any = user.resourceProfile ?? {};
      const identities: RepoAccount[] = (rp.repoIdentities ?? [])
        .filter((i: any) => i.confirmed && i.provider === provider.name)
        .map((i: any) => ({
          provider: provider.name,
          username: i.username,
          email: i.email,
        }));
      if (identities.length === 0) continue; // sin asociación → no sincroniza

      const scope = rp.repoScope ?? { allRepos: true };
      const personRepos = scope.allRepos
        ? repos
        : repos.filter((r) => (scope.repoIds ?? []).includes(r.id));

      try {
        const count = await this.syncPerson(
          provider,
          personRepos,
          identities,
          window,
          user._id.toString(),
          rp.resourceType,
        );
        items.push({
          resourceId: user._id.toString(),
          name: user.name,
          status: 'ok',
          records: count,
        });
      } catch (e) {
        this.logger.error(`Sync falló para ${user.name}: ${(e as Error).message}`);
        items.push({
          resourceId: user._id.toString(),
          name: user.name,
          status: 'error',
          detail: (e as Error).message,
        });
      }
    }

    const run: SyncRunResult = {
      startedAt,
      finishedAt: new Date().toISOString(),
      trigger: opts.trigger,
      week: window.week,
      items,
    };
    this.lastRun = run;
    return run;
  }

  /** Sincroniza una persona: elige analizador por rol, deriva y upserta records. */
  private async syncPerson(
    provider: RepoProvider,
    repos: RepoRef[],
    identities: RepoAccount[],
    window: WeekWindow,
    resourceId: string,
    resourceType?: string,
  ): Promise<number> {
    const values =
      resourceType === 'QA'
        ? await this.qaValues(provider, repos, identities, window)
        : await this.devValues(provider, repos, identities, window);

    let written = 0;
    for (const [metricKey, value] of Object.entries(values)) {
      await this.recordsService.upsert(
        {
          resourceId,
          metricKey,
          week: window.week,
          timestamp: window.until,
          value,
          source: provider.name,
        },
        'repo-sync',
      );
      written += 1;
    }
    return written;
  }

  private async devValues(
    provider: RepoProvider,
    repos: RepoRef[],
    identities: RepoAccount[],
    window: WeekWindow,
  ): Promise<Record<string, number>> {
    const counts = await this.devAnalyzer.computeCounts(provider, repos, identities, window);
    const m = deriveDevMetrics(counts);
    return {
      nui: m.nui,
      dev_efficiency: m.devEfficiency,
      uip_per_day: m.uipPerDay,
      self_churn_rate: m.selfChurnRate,
      fix_ratio_freq: m.fixRatioFreq,
      fix_ratio_vol: m.fixRatioVol,
      commits_per_day: m.commitsPerDay,
      working_days: counts.workingDays,
    };
  }

  private async qaValues(
    provider: RepoProvider,
    repos: RepoRef[],
    identities: RepoAccount[],
    window: WeekWindow,
  ): Promise<Record<string, number>> {
    const counts = await this.qaAnalyzer.computeCounts(provider, repos, identities, window);
    return { validated_acs: counts.validatedAcs };
  }
}
