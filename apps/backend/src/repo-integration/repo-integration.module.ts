import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { RepoIdentityService } from './repo-identity.service';
import { RepoIntegrationController } from './repo-integration.controller';

/**
 * Integración con repositorios (GitHub primero, Bitbucket después).
 * Por ahora expone la asociación persona ↔ cuenta de repo. El analizador (DevAnalyzer /
 * QaAnalyzer), la persistencia y el scheduler se añaden en tareas posteriores.
 */
@Module({
  imports: [UsersModule],
  controllers: [RepoIntegrationController],
  providers: [RepoIdentityService],
  exports: [RepoIdentityService],
})
export class RepoIntegrationModule {}
