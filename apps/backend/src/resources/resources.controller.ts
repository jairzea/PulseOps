import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { MetricsService } from '../metrics/metrics.service';
import { RegisterDto } from '../users/dto/user.dto';
import { UpdateResourceDto } from './dto/resource.dto';
import { CreateResourceDto } from './dto/resource.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

/**
 * ResourcesController: proxy sobre UsersService para exponer una vista
 * operativa de los usuarios cuyo role === 'user'. Evita duplicar datos.
 */
@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(
    private usersService: UsersService,
    private metricsService: MetricsService,
    private authService: AuthService,
  ) {}

  // GET /resources -> lista usuarios con role = user
  @Get()
  async findAll() {
    const users = await this.usersService.findAll(true);
    return users
      .filter((u) => u.role === UserRole.USER)
      .map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        roleType: (user as any).resourceProfile?.resourceType || 'OTHER',
        isActive: user.isActive,
        resourceProfile: (user as any).resourceProfile || null,
        lastLogin: user.lastLogin || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || null,
      }));
  }

  // GET /resources/:id -> detalle completo del recurso
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user || user.role !== UserRole.USER) {
      throw new NotFoundException('Resource not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      roleType: (user as any).resourceProfile?.resourceType || 'OTHER',
      isActive: user.isActive,
      resourceProfile: (user as any).resourceProfile || null,
      lastLogin: user.lastLogin || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || null,
    };
  }

  // GET /resources/:id/metrics -> métricas asociadas al recurso
  @Get(':id/metrics')
  async getResourceMetrics(@Param('id') id: string) {
    // Delegar a MetricsService.findByResource (retorna métricas por resourceId)
    return this.metricsService.findByResource(id);
  }

  // POST /resources -> crea un usuario con role = user
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateResourceDto) {
    // El frontend crea recursos enviando { name, roleType, isActive, metricIds }
    // Mapeamos a la creación de User generando un email/contraseña seguros por defecto
    const generatedEmail = `${dto.name.replace(/\s+/g, '.').toLowerCase()}.${uuidv4().slice(0,8)}@pulseops.local`;
    const generatedPassword = uuidv4().slice(0,12);

    const registerPayload: RegisterDto = {
      email: generatedEmail,
      password: generatedPassword,
      name: dto.name,
      role: UserRole.USER,
      resourceProfile: {
        ...(dto.resourceProfile || {}),
        resourceType: dto.roleType || (dto.resourceProfile && (dto.resourceProfile as any).resourceType) || undefined,
        metricIds: dto.metricIds || [],
      },
    } as any;

    // Usar AuthService.register para aplicar hashing y lógica de registro
    const authResult = await this.authService.register(registerPayload);

    // authResult.user contiene información del usuario creado
    const createdUser = authResult.user;

    // Sincronizar asociaciones en métricas si el frontend envió metricIds
    if (dto.metricIds !== undefined && dto.metricIds.length > 0) {
      try {
        await this.metricsService.syncResourceAssociations(createdUser.id, dto.metricIds || []);
      } catch (err) {
        console.warn('Error sincronizando asociaciones de métricas tras crear recurso:', err);
      }
    }

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      isActive: (createdUser as any).isActive ?? true,
      roleType: (createdUser as any).resourceProfile?.resourceType || 'OTHER',
      resourceProfile: (createdUser as any).resourceProfile || null,
    };
  }

  // PATCH /resources/:id -> actualizar resourceProfile y estado
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    // Forzar que solo se pueda editar resourceProfile y isActive desde este endpoint
    const allowed: any = {};

    // Construir resourceProfile si se envían campos específicos desde el frontend
    const rp: any = (dto as any).resourceProfile ? { ...(dto as any).resourceProfile } : {};
    if (dto.roleType !== undefined) rp.resourceType = dto.roleType;
    if (dto.metricIds !== undefined) rp.metricIds = dto.metricIds;

    if (Object.keys(rp).length > 0) allowed.resourceProfile = rp;
    if (dto.isActive !== undefined) allowed.isActive = dto.isActive;

    const user = await this.usersService.update(id, allowed);

    // Sincronizar asociaciones en métricas si se actualizó la lista de metricIds
    if (dto.metricIds !== undefined) {
      try {
        await this.metricsService.syncResourceAssociations(id, dto.metricIds || []);
      } catch (err) {
        // No bloquear la respuesta por errores en sincronización de métricas
        console.warn('Error sincronizando asociaciones de métricas:', err);
      }
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      roleType: (user as any).resourceProfile?.resourceType || 'OTHER',
      resourceProfile: (user as any).resourceProfile || null,
    };
  }
}
