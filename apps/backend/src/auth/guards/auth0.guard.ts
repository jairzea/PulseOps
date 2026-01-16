import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Auth0 Guard - Placeholder para futura integración
 * TODO: Implementar validación de JWT con Auth0
 */
@Injectable()
export class Auth0Guard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const authMode = this.configService.get<string>('AUTH_MODE', 'demo');

    if (authMode !== 'auth0') {
      return true; // Si no es auth0, no hace nada
    }

    // TODO: Implementar validación de Bearer token
    // const request = context.switchToHttp().getRequest();
    // const token = this.extractTokenFromHeader(request);
    // if (!token) {
    //   throw new UnauthorizedException();
    // }
    // Validar token con Auth0, extraer user, asignar a request.user

    throw new UnauthorizedException('Auth0 integration not yet implemented');
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
