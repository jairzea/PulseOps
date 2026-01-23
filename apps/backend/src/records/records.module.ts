import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import {
  MetricRecord,
  MetricRecordSchema,
} from './schemas/metric-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MetricRecord.name, schema: MetricRecordSchema },
    ]),
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}
