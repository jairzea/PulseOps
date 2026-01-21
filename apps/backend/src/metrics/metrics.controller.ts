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
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto, UpdateMetricDto } from './dto/metric.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/interfaces/user.interface';
import { ForbiddenException } from '../common/exceptions/app.exception';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('metrics')
@UseGuards(DemoOrJwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateMetricDto, @CurrentUser() user: User) {
    return this.metricsService.create(dto, user.id);
  }

  @Get()
  async findAll(
    @Query('resourceId') resourceId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @CurrentUser() user?: User,
  ) {
    if (resourceId) {
      // Si consulta métricas de un recurso, permitir sólo al owner o admin
      const isAdmin = user?.role === UserRole.ADMIN;
      const isOwner = user?.id === resourceId;
      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('Forbidden resource');
      }
      const metrics = await this.metricsService.findByResource(resourceId);
      // Devolver formato paginado para consistencia
      return {
        data: metrics,
        meta: {
          page: 1,
          pageSize: metrics.length,
          totalItems: metrics.length,
          totalPages: 1,
        },
      };
    }

    // Si no se especifica resourceId, sólo admins pueden listar todas las métricas
    const isAdmin = user?.role === UserRole.ADMIN;
    if (!isAdmin) {
      throw new ForbiddenException('Forbidden resource');
    }

    // Si hay parámetros de paginación, usar endpoint paginado
    if (page || pageSize || search) {
      const paginationQuery: PaginationQueryDto = {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        search: search || undefined,
      };
      return this.metricsService.findAllPaginated(paginationQuery);
    }

    // Mantener compatibilidad: sin paginación devolver todo en formato paginado
    const allMetrics = await this.metricsService.findAll();
    return {
      data: allMetrics,
      meta: {
        page: 1,
        pageSize: allMetrics.length,
        totalItems: allMetrics.length,
        totalPages: 1,
      },
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMetricDto) {
    return this.metricsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.metricsService.delete(id);
  }
}
