import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RepoIdentityService } from './repo-identity.service';
import { RepoSyncService } from './repo-sync.service';
import { RepoConnectionService } from './repo-connection.service';
import { GithubProvider } from './providers/github.provider';
import { ConfigService } from '@nestjs/config';
import {
  SetRepoIdentitiesDto,
  RepoProviderName,
} from './dto/repo-identity.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { metricsForRole } from './repo-metrics-catalog';

@Controller('repo-integration')
@UseGuards(DemoOrJwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RepoIntegrationController {
  constructor(
    private readonly identityService: RepoIdentityService,
    private readonly syncService: RepoSyncService,
    private readonly connections: RepoConnectionService,
    private readonly github: GithubProvider,
    private readonly config: ConfigService,
  ) {}

  /** Estado de la integración: modo de auth, repos disponibles y conexiones (modo App). */
  @Get('status')
  async status() {
    const mode = this.github.authMode();
    const configured = mode !== 'none';
    const repos = configured ? await this.github.listRepositories() : [];
    const conns = mode === 'app' ? await this.connections.list() : [];
    return { provider: 'github', mode, configured, repos, connections: conns };
  }

  /**
   * URL para instalar la GitHub App (botón "Conectar GitHub"). El front abre esta URL; tras
   * autorizar, GitHub redirige al front con `installation_id`, que se confirma vía POST.
   */
  @Get('install-url')
  installUrl() {
    const slug = this.config.get<string>('GITHUB_APP_SLUG');
    return {
      url: slug ? `https://github.com/apps/${slug}/installations/new` : null,
    };
  }

  /** Confirma una instalación de la App (el front envía el installation_id del callback). */
  @Post('connections')
  connect(
    @Body() body: { installationId: number },
    @CurrentUser() user: { userId?: string },
  ) {
    return this.connections.upsertInstallation(body.installationId, user?.userId);
  }

  /** Desconecta una instalación. */
  @Delete('connections/:installationId')
  disconnect(@Param('installationId') installationId: string) {
    return this.connections.disconnect(Number(installationId));
  }

  /** Verifica un login de GitHub y devuelve su identidad canónica (o 404→null). */
  @Get('verify-user/:login')
  verifyUser(@Param('login') login: string) {
    return this.github.verifyUser(login);
  }

  /**
   * Catálogo de métricas de repo sugeridas por rol (para la sesión de métricas). Marca las
   * `principal` (candidatas a producción). El admin decide la categoría final.
   */
  @Get('metric-catalog')
  metricCatalog(@Query('role') role?: string) {
    return metricsForRole(role).map((d) => ({
      key: d.key,
      label: d.label,
      description: d.description,
      unit: d.unit,
      defaultCategory: d.defaultCategory,
      principal: d.principal,
    }));
  }

  /** Dispara la sincronización a demanda. */
  @Post('sync')
  sync() {
    return this.syncService.runSync({ trigger: 'manual' });
  }

  /** Último run de sincronización (programado o a demanda). */
  @Get('runs/last')
  lastRun() {
    return this.syncService.getLastRun();
  }

  /** Perfil de repo (identidades + scope) de una persona. */
  @Get('identities/:resourceId')
  getProfile(@Param('resourceId') resourceId: string) {
    return this.identityService.getProfile(resourceId);
  }

  /** Asocia/actualiza identidades y scope de una persona. */
  @Put('identities/:resourceId')
  setIdentities(
    @Param('resourceId') resourceId: string,
    @Body() dto: SetRepoIdentitiesDto,
  ) {
    return this.identityService.setIdentities(resourceId, dto);
  }

  /** Desasocia identidades de un proveedor (o todas si no se indica). */
  @Delete('identities/:resourceId')
  clearIdentities(
    @Param('resourceId') resourceId: string,
    @Query('provider') provider?: RepoProviderName,
  ) {
    return this.identityService.clearIdentities(resourceId, provider);
  }

  /** Sugiere matches por email entre cuentas del proveedor y personas. */
  @Post('suggest-matches')
  suggestMatches(
    @Body()
    body: {
      accounts: Array<{
        provider: RepoProviderName;
        username: string;
        email?: string;
      }>;
    },
  ) {
    return this.identityService.suggestMatches(body.accounts ?? []);
  }
}
