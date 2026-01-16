import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto, UpdateMetricDto } from './dto/metric.dto';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/interfaces/user.interface';

@Controller('metrics')
@UseGuards(DemoAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  create(@Body() dto: CreateMetricDto, @CurrentUser() user: User) {
    return this.metricsService.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.metricsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMetricDto) {
    return this.metricsService.update(id, dto);
  }
}
