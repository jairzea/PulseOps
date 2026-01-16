import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { RecordsModule } from '../records/records.module';
import { RulesModule } from '../rules/rules.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';

@Module({
  imports: [RecordsModule, RulesModule, PlaybooksModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
