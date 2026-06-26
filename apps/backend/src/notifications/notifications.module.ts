import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailService } from './mail.service';
import { UsersModule } from '../users/users.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';

@Module({
  imports: [UsersModule, PlaybooksModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, MailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
