import { Controller, Get } from '@nestjs/common';
import { ConditionsService, ConditionMetadataDto } from './conditions.service';

@Controller('conditions')
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  /**
   * GET /conditions/metadata
   * Retorna metadata de todas las condiciones Hubbard.
   */
  @Get('metadata')
  getConditionsMetadata(): ConditionMetadataDto[] {
    return this.conditionsService.getConditionsMetadata();
  }
}
