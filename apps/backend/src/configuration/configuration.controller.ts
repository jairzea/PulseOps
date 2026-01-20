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
  UseGuards,
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
import { DemoOrJwtAuthGuard } from '../auth/guards/demo-or-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('configuration')
@UseGuards(DemoOrJwtAuthGuard)
export class ConfigurationController {
  constructor(
    private readonly configService: ConfigurationService,
    private readonly rulesService: RulesService,
  ) {}

  // ==================== CONFIGURACIONES ====================

  @Post('analysis')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createConfiguration(@Body() dto: CreateAnalysisConfigurationDto) {
    return this.configService.createConfiguration(dto);
  }

  @Get('analysis')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllConfigurations() {
    return this.configService.getAllConfigurations();
  }

  @Get('analysis/active')
  async getActiveConfiguration() {
    return this.configService.getActiveConfiguration();
  }

  @Get('analysis/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getConfiguration(@Param('id') id: string) {
    return this.configService.getConfigurationById(id);
  }

  @Put('analysis/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateConfiguration(
    @Param('id') id: string,
    @Body() dto: UpdateAnalysisConfigurationDto,
  ) {
    return this.configService.updateConfiguration(id, dto);
  }

  @Delete('analysis/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConfiguration(@Param('id') id: string) {
    return this.configService.deleteConfiguration(id);
  }

  @Post('analysis/:id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async activateConfiguration(@Param('id') id: string) {
    return this.configService.activateConfiguration(id);
  }

  // ==================== REGLAS ====================

  @Post('rules')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createRule(@Body() dto: CreateBusinessRuleDto) {
    return this.rulesService.createRule(dto);
  }

  @Get('rules')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllRules() {
    return this.rulesService.getAllRules();
  }

  @Get('rules/active')
  async getActiveRules() {
    return this.rulesService.getAllRules(true);
  }

  @Get('rules/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRule(@Param('id') id: string) {
    return this.rulesService.getRuleById(id);
  }

  @Get('rules/:id/versions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRuleVersions(@Param('id') id: string) {
    return this.rulesService.getRuleVersions(id);
  }

  @Put('rules/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessRuleDto,
  ) {
    return this.rulesService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRule(@Param('id') id: string) {
    return this.rulesService.deleteRule(id);
  }

  @Delete('rules/:id/permanent')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async permanentlyDeleteRule(@Param('id') id: string) {
    return this.rulesService.permanentlyDeleteRule(id);
  }

  @Post('rules/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleRuleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.rulesService.toggleRuleStatus(id, isActive);
  }
}
