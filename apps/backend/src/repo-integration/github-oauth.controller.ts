import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GithubOauthService } from './github-oauth.service';
import { RepoIdentityService } from './repo-identity.service';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { metricsForRole } from './repo-metrics-catalog';

/**
 * OAuth de usuario (self-service): cualquier usuario autenticado vincula SU propia cuenta.
 * - `/oauth/github/start` exige JWT (sabemos quién es) y devuelve la URL de autorización.
 * - `/oauth/github/callback` es PÚBLICO (GitHub redirige sin nuestro JWT); la identidad del
 *   usuario viaja firmada en el `state`, validada por `GithubOauthService`.
 */
@Controller('repo-integration/oauth/github')
export class GithubOauthController {
  constructor(
    private readonly oauth: GithubOauthService,
    private readonly identities: RepoIdentityService,
    private readonly config: ConfigService,
  ) {}

  /** Inicia el flujo: devuelve la URL de GitHub para vincular la cuenta del usuario actual. */
  @Get('start')
  @UseGuards(DemoOrJwtAuthGuard)
  start(@CurrentUser() user: { userId: string }) {
    return { url: this.oauth.authorizeUrl(user.userId), configured: this.oauth.isConfigured() };
  }

  /** Mi identidad de GitHub vinculada (para mostrarla en el perfil). */
  @Get('me')
  @UseGuards(DemoOrJwtAuthGuard)
  async me(@CurrentUser() user: { userId: string }) {
    const profile = await this.identities.getProfile(user.userId);
    const gh = profile.identities.find((i) => i.provider === 'github');
    return { connected: !!gh, identity: gh ?? null };
  }

  /** Desvincula mi cuenta de GitHub. */
  @Get('disconnect')
  @UseGuards(DemoOrJwtAuthGuard)
  async disconnect(@CurrentUser() user: { userId: string }) {
    await this.identities.clearIdentities(user.userId, 'github');
    return { connected: false };
  }

  /** Catálogo de métricas de repo por rol (accesible a cualquier usuario autenticado). */
  @Get('metric-catalog')
  @UseGuards(DemoOrJwtAuthGuard)
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

  /**
   * Callback de GitHub (PÚBLICO). Canjea el code, vincula la cuenta y redirige al perfil del
   * front con un parámetro de resultado para mostrar feedback.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontend = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      const { login } = await this.oauth.handleCallback(code, state);
      return res.redirect(`${frontend}/profile?github=connected&login=${encodeURIComponent(login)}`);
    } catch {
      return res.redirect(`${frontend}/profile?github=error`);
    }
  }
}
