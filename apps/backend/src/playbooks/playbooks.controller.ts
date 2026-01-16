import { Controller, Get, Put, Post, Param, Body } from '@nestjs/common';
import { PlaybooksService } from './playbooks.service';
import { UpsertPlaybookDto } from './dto/upsert-playbook.dto';
import { HubbardCondition } from './schemas/condition-playbook.schema';

@Controller('playbooks')
export class PlaybooksController {
  constructor(private readonly playbooksService: PlaybooksService) {}

  /**
   * GET /playbooks
   * Obtener todos los playbooks
   */
  @Get()
  async findAll() {
    return this.playbooksService.findAll();
  }

  /**
   * GET /playbooks/:condition
   * Obtener playbook por condición
   */
  @Get(':condition')
  async findByCondition(@Param('condition') condition: HubbardCondition) {
    return this.playbooksService.findByCondition(condition);
  }

  /**
   * PUT /playbooks/:condition
   * Crear o actualizar playbook
   */
  @Put(':condition')
  async upsert(
    @Param('condition') condition: HubbardCondition,
    @Body() dto: UpsertPlaybookDto,
  ) {
    return this.playbooksService.upsert(condition, dto);
  }

  /**
   * POST /playbooks/seed
   * Inicializar playbooks por defecto
   */
  @Post('seed')
  async seed() {
    return this.playbooksService.seed();
  }
}
