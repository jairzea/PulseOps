import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PlaybooksService } from '../playbooks/playbooks.service';
import { HubbardCondition } from '../playbooks/schemas/condition-playbook.schema';
import { MailService } from './mail.service';
import { composeConditionEmail } from './compose-condition-email';
import {
  ResourceNotFoundException,
  ValidationException,
} from '../common/exceptions/app.exception';
import { NotifyConditionDto } from './dto/notify-condition.dto';

export interface NotifyResult {
  sent: boolean;
  to: string;
  condition: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly playbooksService: PlaybooksService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Envía al recurso un correo con su condición y los pasos del playbook correspondiente.
   * Acción manual de un clic tras revisión humana.
   */
  async notifyCondition(dto: NotifyConditionDto): Promise<NotifyResult> {
    // 1. Resolver usuario/recurso (email + name).
    const user = await this.usersService.findById(dto.resourceId);
    if (!user.email) {
      throw new ValidationException(
        'El recurso no tiene un correo asociado para notificar.',
        { resourceId: dto.resourceId },
      );
    }

    // 2. Playbook activo de la condición.
    const playbook = await this.playbooksService.findByCondition(
      dto.condition as HubbardCondition,
    );
    if (!playbook) {
      throw new ResourceNotFoundException('Playbook', dto.condition);
    }

    // 3. Componer y enviar.
    const email = composeConditionEmail({
      name: user.name,
      condition: dto.condition,
      explanation: dto.explanation,
      playbookTitle: playbook.title,
      steps: playbook.steps,
      kind: dto.kind,
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    return { sent: true, to: user.email, condition: dto.condition };
  }
}
