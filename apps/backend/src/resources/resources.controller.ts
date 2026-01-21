import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { MetricsService } from '../metrics/metrics.service';
import { AnalysisService } from '../analysis/analysis.service';
import { RegisterDto } from '../users/dto/user.dto';
import { UpdateResourceDto } from './dto/resource.dto';
import { CreateResourceDto } from './dto/resource.dto';
import { v4 as uuidv4 } from 'uuid';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ForbiddenException } from '../common/exceptions/app.exception';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

/**
 * ResourcesController: proxy sobre UsersService para exponer una vista
 * operativa de los usuarios cuyo role === 'user'. Evita duplicar datos.
 */
@Controller('resources')
@UseGuards(DemoOrJwtAuthGuard)
export class ResourcesController {
  constructor(
    private usersService: UsersService,
    private metricsService: MetricsService,
    private authService: AuthService,
    private analysisService: AnalysisService,
  ) {}

  // GET /resources -> lista usuarios con role = user (con paginación)
  // ADMIN: ve todos los recursos
  // USER: solo ve su propio recurso
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @CurrentUser() currentUser?: any,
  ) {
    // Si hay parámetros de paginación explícitos, usar endpoint paginado
    if (page !== undefined || pageSize !== undefined || search !== undefined) {
      const paginationQuery: PaginationQueryDto = {
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
        search,
      };
      const result = await this.usersService.findAllPaginated(paginationQuery, false, UserRole.USER);
      
      // Mapear usuarios a formato de recursos
      const resourceUsers = result.data.map((user) => ({
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

      // Aplicar filtro de permisos
      let filteredData = resourceUsers;
      if (currentUser?.role === UserRole.USER) {
        filteredData = resourceUsers.filter((r) => r.id === currentUser.id);
      } else if (currentUser?.role !== UserRole.ADMIN) {
        filteredData = [];
      }

      return {
        data: filteredData,
        meta: result.meta,
      };
    }

    // Mantener compatibilidad: sin paginación devolver todo en formato paginado
    const users = await this.usersService.findAll(false);
    const resourceUsers = users
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

    let filteredData = resourceUsers;
    // Si el usuario actual es ADMIN, devolver todos los recursos
    if (currentUser?.role === UserRole.ADMIN) {
      filteredData = resourceUsers;
    }
    // Si es USER, solo devolver su propio recurso
    else if (currentUser?.role === UserRole.USER) {
      filteredData = resourceUsers.filter((r) => r.id === currentUser.id);
    }
    // Si no está autenticado o no tiene rol válido, devolver array vacío
    else {
      filteredData = [];
    }

    return {
      data: filteredData,
      meta: {
        page: 1,
        pageSize: filteredData.length,
        totalItems: filteredData.length,
        totalPages: 1,
      },
    };
  }

  // DELETE /resources/:id -> eliminar recurso (proxy hacia UsersController.delete)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    try {
      await this.usersService.delete(id);
    } catch (err) {
      // Si no existe, devolver NotFound para mantener contrato REST
      if (err instanceof NotFoundException) {
        throw err;
      }
      // Otros errores se propagan
      throw err;
    }
  }

  // GET /resources/:id -> detalle completo del recurso
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    // Los usuarios solo pueden consultar su propio recurso; los admins pueden cualquiera
    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const isOwner = currentUser?.id === id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Forbidden resource');
    }

    const user = await this.usersService.findById(id);
    if (!user || user.role !== UserRole.USER) {
      throw new NotFoundException('Resource not found');
    }
    // Obtener métricas asociadas al recurso
    const metrics = await this.metricsService.findByResource(id);

    // Para visualización: calcular condición actual por métrica (si hay histórico)
    const metricsWithCondition = await Promise.all(
      metrics.map(async (m) => {
        try {
          const evalRes = await this.analysisService.evaluate(id, m.key);
          return {
            id: m.id,
            key: m.key,
            label: m.label,
            resourceIds: m.resourceIds || [],
            currentCondition: evalRes.evaluation?.condition || null,
            confidence: evalRes.evaluation?.confidence ?? null,
          };
        } catch (err) {
          // Si no hay histórico o falla el análisis, devolver sin condición
          return {
            id: m.id,
            key: m.key,
            label: m.label,
            resourceIds: m.resourceIds || [],
            currentCondition: null,
            confidence: null,
          };
        }
      }),
    );

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
      resourceMetrics: metricsWithCondition,
    };
  }

  // GET /resources/:id/metrics -> métricas asociadas al recurso
  @Get(':id/metrics')
  async getResourceMetrics(@Param('id') id: string, @CurrentUser() currentUser: any) {
    const isAdmin = currentUser?.role === UserRole.ADMIN;
    const isOwner = currentUser?.id === id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Forbidden resource');
    }
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
  async update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    const allowed: any = {};

    // Construir resourceProfile a partir del payload (roleType, metricIds o resourceProfile)
    const rp: any = (dto as any).resourceProfile ? { ...(dto as any).resourceProfile } : {};
    if (dto.roleType !== undefined) rp.resourceType = dto.roleType;
    if (dto.metricIds !== undefined) rp.metricIds = dto.metricIds;

    if (Object.keys(rp).length > 0) allowed.resourceProfile = rp;

    // Permitir actualizar el nombre del recurso cuando venga en el payload
    if ((dto as any).name !== undefined) {
      allowed.name = (dto as any).name;
    }

    // Ahora sólo los admins pueden acceder a este controlador, por lo que
    // si isActive viene en el payload se acepta directamente.
    if (dto.isActive !== undefined) {
      allowed.isActive = dto.isActive;
    }

    const user = await this.usersService.update(id, allowed);

    // Sincronizar asociaciones en métricas si se actualizó la lista de metricIds
    if (dto.metricIds !== undefined) {
      try {
        await this.metricsService.syncResourceAssociations(id, dto.metricIds || []);
      } catch (err) {
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
