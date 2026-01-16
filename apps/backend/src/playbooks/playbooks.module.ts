import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaybooksController } from './playbooks.controller';
import { PlaybooksService } from './playbooks.service';
import {
  ConditionPlaybook,
  ConditionPlaybookSchema,
} from './schemas/condition-playbook.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConditionPlaybook.name, schema: ConditionPlaybookSchema },
    ]),
  ],
  controllers: [PlaybooksController],
  providers: [PlaybooksService],
  exports: [PlaybooksService],
})
export class PlaybooksModule {}
