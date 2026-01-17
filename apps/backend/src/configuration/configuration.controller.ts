import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { RulesService } from './rules.service';
import {
  CreateAnalysisConfigurationDto,
  UpdateAnalysisConfigurationDto,
} from './dto/analysis-configuration.dto';
import {
  CreateBusinessRuleDto,
  UpdateBusinessRuleDto,
} from './dto/business-rule.dto';

@Controller('configuration')
export class ConfigurationController {
  constructor(
    private readonly configService: ConfigurationService,
    private readonly rulesService: RulesService,
  ) {}

  // ==================== CONFIGURACIONES ====================

  @Post('analysis')
  async createConfiguration(@Body() dto: CreateAnalysisConfigurationDto) {
    return this.configService.createConfiguration(dto);
  }

  @Get('analysis')
  async getAllConfigurations() {
    return this.configService.getAllConfigurations();
  }

  @Get('analysis/active')
  async getActiveConfiguration() {
    return this.configService.getActiveConfiguration();
  }

  @Get('analysis/:id')
  async getConfiguration(@Param('id') id: string) {
    return this.configService.getConfigurationById(id);
  }

  @Put('analysis/:id')
  async updateConfiguration(
    @Param('id') id: string,
    @Body() dto: UpdateAnalysisConfigurationDto,
  ) {
    return this.configService.updateConfiguration(id, dto);
  }

  @Delete('analysis/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfiguration(@Param('id') id: string) {
    return this.configService.deleteConfiguration(id);
  }

  @Post('analysis/:id/activate')
  async activateConfiguration(@Param('id') id: string) {
    return this.configService.activateConfiguration(id);
  }

  // ==================== REGLAS ====================

  @Post('rules')
  async createRule(@Body() dto: CreateBusinessRuleDto) {
    return this.rulesService.createRule(dto);
  }

  @Get('rules')
  async getAllRules() {
    return this.rulesService.getAllRules();
  }

  @Get('rules/active')
  async getActiveRules() {
    return this.rulesService.getAllRules(true);
  }

  @Get('rules/:id')
  async getRule(@Param('id') id: string) {
    return this.rulesService.getRuleById(id);
  }

  @Get('rules/:id/versions')
  async getRuleVersions(@Param('id') id: string) {
    return this.rulesService.getRuleVersions(id);
  }

  @Put('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessRuleDto,
  ) {
    return this.rulesService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRule(@Param('id') id: string) {
    return this.rulesService.deleteRule(id);
  }

  @Delete('rules/:id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async permanentlyDeleteRule(@Param('id') id: string) {
    return this.rulesService.permanentlyDeleteRule(id);
  }

  @Post('rules/:id/toggle')
  async toggleRuleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.rulesService.toggleRuleStatus(id, isActive);
  }
}
