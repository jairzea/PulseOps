import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { RecordsModule } from '../records/records.module';
import { RepoIdentityService } from './repo-identity.service';
import { RepoIntegrationController } from './repo-integration.controller';
import { GithubProvider } from './providers/github.provider';
import { GithubAuth } from './providers/github-auth';
import { DevAnalyzer } from './dev-analyzer';
import { QaAnalyzer } from './qa-analyzer';
import { RepoSyncService } from './repo-sync.service';
import { RepoSyncScheduler } from './repo-sync.scheduler';
import { RepoConnectionService } from './repo-connection.service';
import {
  RepoConnection,
  RepoConnectionSchema,
} from './schemas/repo-connection.schema';

/**
 * Integración con repositorios (GitHub primero, Bitbucket después).
 * Asociación persona ↔ cuenta, analizadores por rol (Dev/QA), persistencia como MetricRecord,
 * sincronización a demanda y programada. Todo por API — no clona repos.
 */
@Module({
  imports: [
    UsersModule,
    RecordsModule,
    MongooseModule.forFeature([
      { name: RepoConnection.name, schema: RepoConnectionSchema },
    ]),
  ],
  controllers: [RepoIntegrationController],
  providers: [
    RepoIdentityService,
    GithubAuth,
    GithubProvider,
    DevAnalyzer,
    QaAnalyzer,
    RepoSyncService,
    RepoSyncScheduler,
    RepoConnectionService,
  ],
  exports: [RepoIdentityService, RepoSyncService],
})
export class RepoIntegrationModule {}
