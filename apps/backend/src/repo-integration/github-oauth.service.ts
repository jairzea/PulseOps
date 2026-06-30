import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { ServiceUnavailableException } from '../common/exceptions/app.exception';
import { UsersService } from '../users/users.service';

/**
 * OAuth de usuario con GitHub: cada persona vincula SU propia cuenta de un clic. GitHub
 * devuelve la identidad canónica (login real, verificado), eliminando typos.
 *
 * Flujo:
 *  1. `authorizeUrl(userId)` → URL de GitHub con un `state` firmado (HMAC) que lleva el userId
 *     y un timestamp (anti-CSRF y anti-replay). El callback llega sin JWT, por eso el userId
 *     viaja firmado en el state.
 *  2. `handleCallback(code, state)` → valida el state, intercambia el code por un token de
 *     usuario, consulta `GET /user`, y guarda el login en el perfil de ESA persona (confirmado).
 *
 * ponytail: state = base64(payload).hmac, sin tabla de states en DB (stateless, expira a los
 * 10 min). Ceiling: no soporta rotación de secreto a mitad de flujo; upgrade = store de states.
 */
@Injectable()
export class GithubOauthService {
  private readonly api = 'https://api.github.com';
  private readonly authBase = 'https://github.com/login/oauth';
  private readonly stateTtlMs = 10 * 60 * 1000;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  isConfigured(): boolean {
    return (
      !!this.config.get<string>('GITHUB_OAUTH_CLIENT_ID') &&
      !!this.config.get<string>('GITHUB_OAUTH_CLIENT_SECRET')
    );
  }

  private secret(): string {
    // Reutiliza el JWT_SECRET para firmar el state (mismo nivel de confianza del proceso).
    return this.config.get<string>('JWT_SECRET') ?? 'dev-oauth-state';
  }

  private signState(userId: string): string {
    const payload = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString('base64url');
    const sig = createHmac('sha256', this.secret()).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  private verifyState(state: string): string | null {
    const [payload, sig] = state.split('.');
    if (!payload || !sig) return null;
    const expected = createHmac('sha256', this.secret()).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    try {
      const { userId, ts } = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (Date.now() - ts > this.stateTtlMs) return null; // expirado
      return userId;
    } catch {
      return null;
    }
  }

  /** URL de autorización de GitHub para vincular la cuenta del `userId`. */
  authorizeUrl(userId: string): string {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('OAuth de GitHub no configurado.');
    }
    const params = new URLSearchParams({
      client_id: this.config.get<string>('GITHUB_OAUTH_CLIENT_ID') as string,
      redirect_uri: this.config.get<string>('GITHUB_OAUTH_CALLBACK_URL') as string,
      scope: 'read:user',
      state: this.signState(userId),
      allow_signup: 'false',
    });
    return `${this.authBase}/authorize?${params.toString()}`;
  }

  /**
   * Procesa el callback: valida state, canjea el code y vincula la cuenta al usuario.
   * Devuelve el login vinculado (para feedback en el front).
   */
  async handleCallback(code: string, state: string): Promise<{ login: string }> {
    const userId = this.verifyState(state);
    if (!userId) {
      throw new ServiceUnavailableException('State inválido o expirado.');
    }

    // 1. code → access token de usuario.
    const tokenRes = await fetch(`${this.authBase}/access_token`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.config.get<string>('GITHUB_OAUTH_CLIENT_ID'),
        client_secret: this.config.get<string>('GITHUB_OAUTH_CLIENT_SECRET'),
        code,
        redirect_uri: this.config.get<string>('GITHUB_OAUTH_CALLBACK_URL'),
      }),
    });
    const tokenBody = (await tokenRes.json()) as { access_token?: string };
    if (!tokenBody.access_token) {
      throw new ServiceUnavailableException('No se pudo obtener el token de GitHub.');
    }

    // 2. token → identidad canónica del usuario.
    const userRes = await fetch(`${this.api}/user`, {
      headers: {
        Authorization: `Bearer ${tokenBody.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (!userRes.ok) {
      throw new ServiceUnavailableException('No se pudo leer el perfil de GitHub.');
    }
    const ghUser = (await userRes.json()) as { login: string; email?: string };

    // 3. Guardar en el perfil de ESA persona (confirmado: lo vinculó él mismo).
    const user = await this.usersService.findById(userId);
    const rp: any = user.resourceProfile ?? {};
    const others = (rp.repoIdentities ?? []).filter((i: any) => i.provider !== 'github');
    await this.usersService.setRepoProfile(userId, {
      repoIdentities: [
        ...others,
        {
          provider: 'github',
          username: ghUser.login,
          email: ghUser.email ?? undefined,
          confirmed: true,
        },
      ],
    });

    return { login: ghUser.login };
  }
}
