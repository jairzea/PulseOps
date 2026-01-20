import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DemoOrJwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMode = this.configService.get<string>('AUTH_MODE', 'demo');
    const request = context.switchToHttp().getRequest();

    if (authMode === 'demo') {
      // Inyectar usuario demo para desarrollo con la misma forma que JwtStrategy
      // JwtStrategy adjunta { userId, email, role } a request.user
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
