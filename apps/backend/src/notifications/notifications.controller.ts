import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotifyConditionDto } from './dto/notify-condition.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';

@Controller('notifications')
@UseGuards(DemoOrJwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /notifications/condition
   * Envía al recurso un correo con su condición + pasos del playbook (un clic).
   */
  @Post('condition')
  notifyCondition(@Body() dto: NotifyConditionDto) {
    return this.notificationsService.notifyCondition(dto);
  }
}
