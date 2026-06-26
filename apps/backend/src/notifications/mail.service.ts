import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ServiceUnavailableException } from '../common/exceptions/app.exception';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Servicio de envío de correo vía SMTP (nodemailer).
 *
 * Aísla el proveedor: el resto del backend depende de `sendMail`, no de SMTP. La
 * migración futura a Google Workspace es reimplementar este servicio sin tocar el resto.
 *
 * ponytail: un transport por envío, sin pool ni reintentos; suficiente para envíos
 * manuales de un clic. Upgrade futuro: pool + cola si el volumen crece.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  /** True si hay configuración SMTP mínima (host) presente. */
  isConfigured(): boolean {
    return !!this.config.get<string>('SMTP_HOST');
  }

  private buildTransport(): nodemailer.Transporter {
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) {
      // No logear credenciales ni detalles sensibles.
      throw new ServiceUnavailableException(
        'El servicio de correo no está configurado (falta SMTP_HOST).',
      );
    }

    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const secure =
      (this.config.get<string>('SMTP_SECURE') ?? 'false') === 'true';
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASSWORD');

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });
  }

  /**
   * Envía un correo. Lanza ServiceUnavailableException si SMTP no está configurado
   * o si el envío falla. Nunca incluye credenciales en logs ni en el error.
   */
  async sendMail(message: MailMessage): Promise<void> {
    const transport = this.buildTransport();
    const from = this.config.get<string>('SMTP_FROM') ?? 'PulseOps <no-reply@pulseops.local>';

    try {
      await transport.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      this.logger.log(`Correo enviado a ${message.to} (${message.subject})`);
    } catch (err) {
      // Mensaje del error de transporte sin exponer credenciales (no incluye auth).
      const reason = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableException(
        'No se pudo enviar el correo.',
        { reason },
      );
    }
  }
}
