import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SetRepoIdentitiesDto, RepoProviderName } from './dto/repo-identity.dto';

export interface PersonRepoProfile {
  resourceId: string;
  name: string;
  email: string;
  roleType: string;
  identities: Array<{
    provider: RepoProviderName;
    username?: string;
    email?: string;
    confirmed: boolean;
  }>;
  scope: { allRepos: boolean; repoIds?: string[] };
}

/**
 * Gestiona la asociación persona ↔ cuenta de repositorio.
 * Las identidades viven dentro de `resourceProfile` (objeto libre), sin migración.
 */
@Injectable()
export class RepoIdentityService {
  constructor(private readonly usersService: UsersService) {}

  /** Lee el perfil de repo de un recurso. */
  async getProfile(resourceId: string): Promise<PersonRepoProfile> {
    const user = await this.usersService.findById(resourceId);
    const rp: any = user.resourceProfile ?? {};
    return {
      resourceId,
      name: user.name,
      email: user.email,
      roleType: rp.resourceType ?? 'OTHER',
      identities: rp.repoIdentities ?? [],
      scope: rp.repoScope ?? { allRepos: true },
    };
  }

  /** Asocia/actualiza identidades y scope de una persona. */
  async setIdentities(
    resourceId: string,
    dto: SetRepoIdentitiesDto,
  ): Promise<PersonRepoProfile> {
    await this.usersService.setRepoProfile(resourceId, {
      repoIdentities: dto.identities,
      repoScope: dto.scope ?? { allRepos: true },
    });
    return this.getProfile(resourceId);
  }

  /** Desasocia todas las identidades de un proveedor (o todas si no se indica). */
  async clearIdentities(
    resourceId: string,
    provider?: RepoProviderName,
  ): Promise<PersonRepoProfile> {
    const profile = await this.getProfile(resourceId);
    const remaining = provider
      ? profile.identities.filter((i) => i.provider !== provider)
      : [];
    await this.usersService.setRepoProfile(resourceId, {
      repoIdentities: remaining,
    });
    return this.getProfile(resourceId);
  }

  /**
   * Sugiere matches automáticos entre cuentas del proveedor y personas, por coincidencia
   * de email de empresa. Devuelve, por cada cuenta, la persona sugerida (si la hay).
   * No persiste: el admin confirma. `confirmed: false` marca que es una sugerencia.
   */
  async suggestMatches(
    accounts: Array<{ provider: RepoProviderName; username: string; email?: string }>,
  ): Promise<
    Array<{
      account: { provider: RepoProviderName; username: string; email?: string };
      suggestedResourceId: string | null;
      suggestedName: string | null;
    }>
  > {
    const users = await this.usersService.findAll(false);
    // Incluye admins (dev/arquitecto también se miden, doc Gemini), no solo role USER.
    const byEmail = new Map(
      users.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u]),
    );

    return accounts.map((acc) => {
      const match = acc.email ? byEmail.get(acc.email.toLowerCase()) : undefined;
      return {
        account: acc,
        suggestedResourceId: match ? match._id.toString() : null,
        suggestedName: match ? match.name : null,
      };
    });
  }
}
