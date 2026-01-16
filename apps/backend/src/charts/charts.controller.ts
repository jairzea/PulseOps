import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChartsService } from './charts.service';
import { CreateChartDto, UpdateChartDto } from './dto/chart.dto';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/interfaces/user.interface';

@Controller('charts')
@UseGuards(DemoAuthGuard)
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Post()
  create(@Body() dto: CreateChartDto, @CurrentUser() user: User) {
    return this.chartsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query('resourceId') resourceId?: string) {
    return this.chartsService.findAll(resourceId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChartDto) {
    return this.chartsService.update(id, dto);
  }
}
