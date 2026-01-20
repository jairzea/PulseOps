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
    @CurrentUser() user?: User,
  ) {
    if (resourceId) {
      // Si consulta métricas de un recurso, permitir sólo al owner o admin
      const isAdmin = user?.role === UserRole.ADMIN;
      const isOwner = user?.id === resourceId;
      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('Forbidden resource');
      }
      return this.metricsService.findByResource(resourceId);
    }

    // Si no se especifica resourceId, sólo admins pueden listar todas las métricas
    const isAdmin = user?.role === UserRole.ADMIN;
    if (!isAdmin) {
      throw new ForbiddenException('Forbidden resource');
    }
    return this.metricsService.findAll();
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
