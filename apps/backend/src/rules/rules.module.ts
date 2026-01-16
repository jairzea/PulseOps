import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import {
  MetricRuleConfig,
  MetricRuleConfigSchema,
} from './schemas/metric-rule-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MetricRuleConfig.name, schema: MetricRuleConfigSchema },
    ]),
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
