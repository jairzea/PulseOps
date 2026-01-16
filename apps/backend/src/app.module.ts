import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResourcesModule } from './resources/resources.module';
import { MetricsModule } from './metrics/metrics.module';
import { ChartsModule } from './charts/charts.module';
import { RecordsModule } from './records/records.module';
import { RulesModule } from './rules/rules.module';
import { AnalysisModule } from './analysis/analysis.module';
import { PlaybooksModule } from './playbooks/playbooks.module';
import { ConditionsModule } from './conditions/conditions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/pulseops',
    ),
    ResourcesModule,
    MetricsModule,
    ChartsModule,
    RecordsModule,
    RulesModule,
    AnalysisModule,
    PlaybooksModule,
    ConditionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
