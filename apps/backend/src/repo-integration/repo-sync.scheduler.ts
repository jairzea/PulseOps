import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RepoSyncService } from './repo-sync.service';

/**
 * Disparador programado de la sincronización. Default: miércoles 18:00 GMT-5.
 * Configurable por env `REPO_SYNC_DOW` (0=Dom..6=Sáb, default 3) y `REPO_SYNC_HOUR` (0..23,
 * default 18). Si `REPO_SYNC_ENABLED` != 'true', no se programa nada (solo queda el endpoint
 * a demanda).
 *
 * ponytail: en vez de añadir `@nestjs/schedule` (cron + dep nueva con fricción de install en
 * este entorno), se usa un `setInterval` de 1 min que comprueba día/hora GMT-5 y dispara una
 * vez por ventana. Ceiling: si el proceso está caído justo a esa hora, se pierde ese disparo
 * (mitigado por el botón "Sincronizar ahora"). Upgrade path: migrar a `@nestjs/schedule`.
 */
@Injectable()
export class RepoSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RepoSyncScheduler.name);
  private timer?: NodeJS.Timeout;
  private lastFiredKey = ''; // "YYYY-MM-DD-HH" GMT-5 ya disparado (evita doble disparo)
  private readonly GMT5_MS = 5 * 60 * 60 * 1000;

  constructor(
    private readonly config: ConfigService,
    private readonly syncService: RepoSyncService,
  ) {}

  onModuleInit(): void {
    if (this.config.get<string>('REPO_SYNC_ENABLED') !== 'true') {
      this.logger.log('Sync programada deshabilitada (REPO_SYNC_ENABLED != true).');
      return;
    }
    const dow = Number(this.config.get('REPO_SYNC_DOW') ?? 3);
    const hour = Number(this.config.get('REPO_SYNC_HOUR') ?? 18);
    this.logger.log(`Sync programada: día ${dow} a las ${hour}:00 GMT-5.`);

    this.timer = setInterval(() => this.tick(dow, hour), 60 * 1000);
    this.timer.unref?.(); // no mantener vivo el proceso solo por este timer
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private tick(targetDow: number, targetHour: number): void {
    const local = new Date(Date.now() - this.GMT5_MS); // "hora GMT-5" en campos UTC
    if (local.getUTCDay() !== targetDow || local.getUTCHours() !== targetHour) return;

    const key = `${local.toISOString().slice(0, 13)}`; // hasta la hora
    if (key === this.lastFiredKey) return; // ya disparado en esta hora
    this.lastFiredKey = key;

    this.logger.log('Disparando sync programada…');
    this.syncService
      .runSync({ trigger: 'scheduled' })
      .then((r) =>
        this.logger.log(`Sync programada OK: ${r.items.length} personas, semana ${r.week}.`),
      )
      .catch((e) => this.logger.error(`Sync programada falló: ${e.message}`));
  }
}
