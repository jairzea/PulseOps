import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { RecordsModule } from '../records/records.module';
import { RulesModule } from '../rules/rules.module';

@Module({
  imports: [RecordsModule, RulesModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
