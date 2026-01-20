import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
    sub: string;  // user ID
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'pulseops-secret-key-change-in-production',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.sub);
        
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Este objeto se adjunta a request.user
        // Incluir `id` además de `userId` para mantener compatibilidad
        // con código que espera `user.id` (p.ej. controllers que usan CurrentUser())
        return {
            userId: payload.sub,
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
