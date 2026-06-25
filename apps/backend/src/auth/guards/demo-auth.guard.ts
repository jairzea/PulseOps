import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Demo Auth Guard - Inyecta usuario demo para desarrollo
 * Solo activo cuando AUTH_MODE=demo
 */
@Injectable()
export class DemoAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const configuredMode = this.configService.get<string>('AUTH_MODE', 'demo');
    // En producción el modo demo queda deshabilitado.
    const authMode = nodeEnv === 'production' ? 'jwt' : configuredMode;

    if (authMode !== 'demo') {
      return true; // Si no es demo, deja pasar (otro guard manejará)
    }

    const request = context.switchToHttp().getRequest();

    // Inyectar usuario demo
    request.user = {
      id: 'demo-admin',
      email: 'demo@pulseops.local',
      role: 'admin',
    };

    return true;
  }
}
