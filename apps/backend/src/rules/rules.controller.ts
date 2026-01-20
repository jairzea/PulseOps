import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto, SimulateRuleDto } from './dto/rule.dto';
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/interfaces/user.interface';
import { analysisEngine } from '@pulseops/analysis-engine';

@Controller('rules')
@UseGuards(DemoOrJwtAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  create(@Body() dto: CreateRuleDto, @CurrentUser() user: User) {
    return this.rulesService.create(dto, user.id);
  }

  @Get()
  findByMetricKey(@Query('metricKey') metricKey: string) {
    return this.rulesService.findByMetricKey(metricKey);
  }

  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.rulesService.activate(id);
  }

  @Post('simulate')
  async simulate(@Body() dto: SimulateRuleDto) {
    const { series, configOverride } = dto;

    // Usar config override o defaults del engine
    const config = configOverride
      ? {
          size: configOverride.windowSize || 2,
          thresholds: configOverride.thresholds as any,
        }
      : undefined;

    const evaluation = analysisEngine.analyzeWithConditions(series, config);

    return { evaluation };
  }
}
