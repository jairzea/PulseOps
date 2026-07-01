import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RepoConnection,
  RepoConnectionDocument,
} from './schemas/repo-connection.schema';
import { GithubProvider } from './providers/github.provider';

/**
 * Gestiona las conexiones de GitHub App (instalaciones). Solo persiste `installationId` +
 * cuenta — nunca secretos. Tras el callback de instalación, registra/reactiva la conexión.
 */
@Injectable()
export class RepoConnectionService {
  constructor(
    @InjectModel(RepoConnection.name)
    private readonly model: Model<RepoConnectionDocument>,
    private readonly github: GithubProvider,
  ) {}

  list(): Promise<RepoConnection[]> {
    return this.model.find({ isActive: true }).exec();
  }

  /** Registra (o reactiva) una instalación tras el callback de GitHub. */
  async upsertInstallation(
    installationId: number,
    connectedBy?: string,
  ): Promise<RepoConnection> {
    // Resolver la cuenta donde se instaló consultando las instalaciones de la App.
    let account = '';
    try {
      const installs = await this.github.listInstallations();
      account = installs.find((i) => i.id === installationId)?.account ?? '';
    } catch {
      // si falla la consulta, igual guardamos la instalación; la cuenta se completa luego
    }
    return this.model
      .findOneAndUpdate(
        { provider: 'github', installationId },
        { provider: 'github', installationId, account, isActive: true, connectedBy },
        { upsert: true, new: true },
      )
      .exec();
  }

  /** Desconecta una instalación (soft-delete; la App se desinstala desde GitHub). */
  async disconnect(installationId: number): Promise<void> {
    await this.model
      .updateOne({ provider: 'github', installationId }, { isActive: false })
      .exec();
  }
}
