import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { PlaybooksService } from './playbooks.service';
import { UpsertPlaybookDto } from './dto/upsert-playbook.dto';
import { HubbardCondition } from './schemas/condition-playbook.schema';

const VALID_CONDITIONS = [
  'PODER',
  'CAMBIO_DE_PODER',
  'AFLUENCIA',
  'NORMAL',
  'EMERGENCIA',
  'PELIGRO',
  'INEXISTENCIA',
  'SIN_DATOS',
] as const;

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
  async findByCondition(@Param('condition') condition: string) {
    if (!VALID_CONDITIONS.includes(condition as any)) {
      throw new BadRequestException(
        `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(', ')}`,
      );
    }
    return this.playbooksService.findByCondition(condition as HubbardCondition);
  }

  /**
   * PUT /playbooks/:condition
   * Crear o actualizar playbook
   */
  @Put(':condition')
  async upsert(
    @Param('condition') condition: string,
    @Body() dto: UpsertPlaybookDto,
  ) {
    if (!VALID_CONDITIONS.includes(condition as any)) {
      throw new BadRequestException(
        `Invalid condition. Must be one of: ${VALID_CONDITIONS.join(', ')}`,
      );
    }
    return this.playbooksService.upsert(condition as HubbardCondition, dto);
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
