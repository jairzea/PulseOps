import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '../../common/exceptions/app.exception';
import { signAppJwt } from './app-jwt';

/**
 * Resuelve el token de acceso a la API de GitHub según el modo configurado:
 *
 *  - **GitHub App** (estándar de la industria, multi-instalación): si hay `GITHUB_APP_ID` +
 *    `GITHUB_APP_PRIVATE_KEY`, se firma un App JWT y se acuña un **token de instalación
 *    efímero** (~1h) por `installationId`. Es lo que se usa en producción.
 *  - **PAT** (bootstrap / pruebas Nivel 0): si solo hay `GITHUB_TOKEN`, se usa tal cual.
 *    Sirve para validar el motor contra repos personales sin registrar una App.
 *
 * ponytail: cachea el token de instalación en memoria hasta ~5 min antes de expirar. Ceiling:
 * cache por proceso (si hay varias instancias, cada una acuña el suyo — GitHub lo permite).
 */
@Injectable()
export class GithubAuth {
  private readonly logger = new Logger(GithubAuth.name);
  private readonly api = 'https://api.github.com';
  private cache = new Map<string, { token: string; expiresAt: number }>();

  constructor(private readonly config: ConfigService) {}

  /** Modo activo, para que la UI muestre el estado correcto. */
  mode(): 'app' | 'pat' | 'none' {
    if (this.config.get<string>('GITHUB_APP_ID') && this.appPrivateKey()) return 'app';
    if (this.config.get<string>('GITHUB_TOKEN')) return 'pat';
    return 'none';
  }

  isConfigured(): boolean {
    return this.mode() !== 'none';
  }

  private appPrivateKey(): string | undefined {
    return this.config.get<string>('GITHUB_APP_PRIVATE_KEY');
  }

  /**
   * Token para llamar a la API. En modo App requiere el `installationId` de la conexión.
   * En modo PAT lo ignora.
   */
  async accessToken(installationId?: number): Promise<string> {
    const mode = this.mode();
    if (mode === 'pat') return this.config.get<string>('GITHUB_TOKEN') as string;
    if (mode === 'app') return this.installationToken(installationId);
    throw new ServiceUnavailableException(
      'Integración con GitHub no configurada (define GITHUB_APP_ID+PRIVATE_KEY o GITHUB_TOKEN).',
    );
  }

  /** App JWT (identifica al producto ante GitHub, no a una instalación). */
  appJwt(): string {
    const appId = this.config.get<string>('GITHUB_APP_ID');
    const pem = this.appPrivateKey();
    if (!appId || !pem) {
      throw new ServiceUnavailableException('GitHub App no configurada.');
    }
    return signAppJwt(appId, pem);
  }

  private async installationToken(installationId?: number): Promise<string> {
    if (!installationId) {
      throw new ServiceUnavailableException(
        'Falta installationId: conecta la organización desde Integraciones.',
      );
    }
    const key = String(installationId);
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAt - 5 * 60 * 1000 > now) return cached.token;

    const res = await fetch(`${this.api}/app/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.appJwt()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (!res.ok) {
      throw new ServiceUnavailableException('No se pudo acuñar el token de instalación.', {
        status: res.status,
      });
    }
    const body = (await res.json()) as { token: string; expires_at: string };
    this.cache.set(key, {
      token: body.token,
      expiresAt: new Date(body.expires_at).getTime(),
    });
    return body.token;
  }
}
