import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ConditionsService, ConditionMetadataDto } from './conditions.service';
import { HubbardCondition } from '@pulseops/shared-types';

@Controller('conditions')
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  /**
   * GET /conditions/metadata
   * Retorna metadata de todas las condiciones Hubbard.
   */
  @Get('metadata')
  async getConditionsMetadata(): Promise<ConditionMetadataDto[]> {
    return this.conditionsService.getConditionsMetadata();
  }

  /**
   * PATCH /conditions/:condition/color
   * Actualiza el color glow de una condición específica.
   */
  @Patch(':condition/color')
  async updateConditionColor(
    @Param('condition') condition: HubbardCondition,
    @Body('glow') glow: string,
  ): Promise<ConditionMetadataDto> {
    return this.conditionsService.updateConditionColor(condition, glow);
  }
}
