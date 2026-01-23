import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConditionsController } from './conditions.controller';
import { ConditionsService } from './conditions.service';
import {
  ConditionMetadata,
  ConditionMetadataSchema,
} from './schemas/condition-metadata.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConditionMetadata.name, schema: ConditionMetadataSchema },
    ]),
  ],
  controllers: [ConditionsController],
  providers: [ConditionsService],
  exports: [ConditionsService],
})
export class ConditionsModule {}
