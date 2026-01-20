import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { RecordsModule } from '../records/records.module';
import { RulesModule } from '../rules/rules.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
  imports: [RecordsModule, RulesModule, PlaybooksModule, ConfigurationModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
