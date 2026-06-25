import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DemoOrJwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const configuredMode = this.configService.get<string>('AUTH_MODE', 'demo');
    // En producción el modo demo queda deshabilitado: siempre se exige JWT.
    const authMode = nodeEnv === 'production' ? 'jwt' : configuredMode;
    const request = context.switchToHttp().getRequest();

    if (authMode === 'demo') {
      // Si en modo demo se provee un Authorization header, intentar delegar
      // al guard JWT para permitir pruebas con tokens reales.
      const authHeader = (request.headers && request.headers.authorization) || null;
      if (authHeader) {
        const JwtGuardClass = AuthGuard('jwt') as any;
        const jwtGuard = new JwtGuardClass();
        const result = await jwtGuard.canActivate(context as any);
        return result as boolean;
      }

      // Si no hay Authorization, inyectar usuario demo para desarrollo
      request.user = {
        userId: 'demo-admin',
        id: 'demo-admin',
        email: 'demo@pulseops.local',
        role: 'admin',
      };
      return true;
    }

    // En entorno distinto a demo, delegar a AuthGuard('jwt') dinámicamente
    const JwtGuardClass = AuthGuard('jwt') as any;
    const jwtGuard = new JwtGuardClass();
    const result = await jwtGuard.canActivate(context as any);
    return result as boolean;
  }
}
