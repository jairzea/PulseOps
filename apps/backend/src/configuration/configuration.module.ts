import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { RulesService } from './rules.service';
import {
  AnalysisConfiguration,
  AnalysisConfigurationSchema,
} from './schemas/analysis-configuration.schema';
import {
  BusinessRule,
  BusinessRuleSchema,
} from './schemas/business-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalysisConfiguration.name, schema: AnalysisConfigurationSchema },
      { name: BusinessRule.name, schema: BusinessRuleSchema },
    ]),
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService, RulesService],
  exports: [ConfigurationService, RulesService],
})
export class ConfigurationModule {}
