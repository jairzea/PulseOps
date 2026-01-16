import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';

@Controller('analysis')
@UseGuards(DemoAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('evaluate')
  evaluate(
    @Query('resourceId') resourceId: string,
    @Query('metricKey') metricKey: string,
    @Query('windowSize') windowSize?: string,
  ) {
    const parsedWindowSize = windowSize ? parseInt(windowSize, 10) : undefined;
    return this.analysisService.evaluate(
      resourceId,
      metricKey,
      parsedWindowSize,
    );
  }
}
