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
    const authMode = this.configService.get<string>('AUTH_MODE', 'demo');

    // Solo activar guard en modo demo
    if (authMode !== 'demo') {
      return false; // Rechazar acceso, otro guard debe manejar la autenticación
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
