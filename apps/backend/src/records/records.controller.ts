import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto, QueryRecordsDto } from './dto/record.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';import { PaginationQueryDto } from '../common/dto/pagination-query.dto';import { User } from '../common/interfaces/user.interface';

@Controller('records')
@UseGuards(DemoOrJwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  async upsert(@Body() dto: CreateRecordDto, @CurrentUser() user: User | null) {
    const createdBy = (user && (user as any).id) ? (user as any).id : 'system';
    return this.recordsService.upsert(dto, createdBy);
  }

  @Get()
  async findMany(
    @Query() query: QueryRecordsDto & PaginationQueryDto,
    @CurrentUser() user?: User,
  ) {
    // Si se filtra por resourceId, permitir owner o admin
    const resourceId = (query as any).resourceId as string | undefined;
    if (resourceId) {
      const isAdmin = user?.role === UserRole.ADMIN;
      const isOwner = user?.id === resourceId;
      if (!isAdmin && !isOwner) {
        throw new ForbiddenException('Forbidden resource');
      }
    } else {
      // Sin filtro, sólo admins pueden listar todos los registros
      const isAdmin = user?.role === UserRole.ADMIN;
      if (!isAdmin) {
        throw new ForbiddenException('Forbidden resource');
      }
    }

    // Extraer filtros de QueryRecordsDto
    const filters = {
      resourceId: (query as any).resourceId,
      metricKey: (query as any).metricKey,
      fromWeek: (query as any).fromWeek,
      toWeek: (query as any).toWeek,
    };

    // Si hay parámetros de paginación, usar endpoint paginado
    if (query.page || query.pageSize || query.search) {
      return this.recordsService.findManyPaginated(query, filters);
    }

    // Mantener compatibilidad: sin paginación devolver todo
    return this.recordsService.findMany(filters);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    const deleted = await this.recordsService.delete(id);
    return { deleted };
  }
}
