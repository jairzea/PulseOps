import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '../users/dto/user.dto';
import { DemoOrJwtAuthGuard } from './guards/demo-or-jwt.guard';
import {
  CurrentUser,
  CurrentUserData,
} from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(DemoOrJwtAuthGuard)
  async getProfile(@CurrentUser() user: CurrentUserData) {
    const fullUser = await this.usersService.findById(user.userId);
    return {
      id: fullUser._id.toString(),
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      isActive: fullUser.isActive,
      lastLogin: fullUser.lastLogin,
      createdAt: fullUser.createdAt,
    };
  }

  @Post('validate')
  @UseGuards(DemoOrJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async validateToken(@CurrentUser() user: CurrentUserData) {
    return {
      valid: true,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }
}
