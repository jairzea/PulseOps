import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/interfaces/user.interface';
import { MetricsService } from '../metrics/metrics.service';

@Controller('resources')
@UseGuards(DemoAuthGuard)
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  create(@Body() dto: CreateResourceDto, @CurrentUser() user: User) {
    return this.resourcesService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id/metrics')
  getMetricsByResource(@Param('id') id: string) {
    return this.metricsService.findByResource(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
