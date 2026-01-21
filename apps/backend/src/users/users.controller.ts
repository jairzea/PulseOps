import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, RegisterDto, ChangePasswordDto } from './dto/user.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '../auth/decorators/current-user.decorator';
import { UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('users')
@UseGuards(DemoOrJwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.usersService.findAllPaginated(query, true);
    
    return {
      data: result.data.map((user) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    // Los usuarios solo pueden ver su propio perfil, los admin pueden ver todos
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new Error('Forbidden');
    }

    const user = await this.usersService.findById(id);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: RegisterDto) {
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    // Los usuarios solo pueden actualizar su propio perfil (excepto role)
    // Los admin pueden actualizar cualquier perfil
    if (currentUser.role !== UserRole.ADMIN) {
      if (currentUser.userId !== id) {
        throw new Error('Forbidden');
      }
      // Los usuarios no pueden cambiar su propio rol
      delete updateUserDto.role;
      delete updateUserDto.isActive;
    }

    const user = await this.usersService.update(id, updateUserDto);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    // Solo el propio usuario puede cambiar su contraseña
    if (currentUser.userId !== id) {
      throw new Error('Forbidden');
    }

    await this.usersService.changePassword(id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Query('hard') hard?: string) {
    if (hard === 'true') {
      await this.usersService.hardDelete(id);
      return;
    }

    await this.usersService.delete(id);
  }
}
