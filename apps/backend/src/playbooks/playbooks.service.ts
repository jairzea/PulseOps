import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConditionPlaybook,
  HubbardCondition,
} from './schemas/condition-playbook.schema';
import { UpsertPlaybookDto } from './dto/upsert-playbook.dto';

@Injectable()
export class PlaybooksService {
  constructor(
    @InjectModel(ConditionPlaybook.name)
    private playbookModel: Model<ConditionPlaybook>,
  ) {}

  /**
   * Obtener todos los playbooks (activos e inactivos)
   * Se usa en la página de configuración para poder gestionar todas las condiciones
   */
  async findAll(): Promise<ConditionPlaybook[]> {
    return this.playbookModel.find({}).exec();
  }

  /**
   * Obtener playbook por condición
   */
  async findByCondition(
    condition: HubbardCondition,
  ): Promise<ConditionPlaybook | null> {
    return this.playbookModel.findOne({ condition, isActive: true }).exec();
  }

  /**
   * Crear o actualizar playbook (upsert)
   */
  async upsert(
    condition: HubbardCondition,
    dto: UpsertPlaybookDto,
  ): Promise<ConditionPlaybook> {
    const existing = await this.playbookModel.findOne({ condition }).exec();

    if (existing) {
      // Actualizar existente
      existing.title = dto.title;
      existing.steps = dto.steps;
      existing.version = dto.version ?? existing.version + 1;
      existing.isActive = dto.isActive ?? existing.isActive;
      existing.updatedAt = new Date().toISOString();
      return existing.save();
    } else {
      // Crear nuevo
      return this.playbookModel.create({
        condition,
        title: dto.title,
        steps: dto.steps,
        version: dto.version ?? 1,
        isActive: dto.isActive ?? true,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Seed inicial con todas las fórmulas Hubbard
   */
  async seed(): Promise<{ message: string; created: number }> {
    const count = await this.playbookModel.countDocuments();

    if (count > 0) {
      return { message: 'Playbooks already exist, skipping seed', created: 0 };
    }

    const playbooks = this.getDefaultPlaybooks();
    await this.playbookModel.insertMany(playbooks);

    return {
      message: 'Playbooks seeded successfully',
      created: playbooks.length,
    };
  }

  /**
   * Catálogo oficial de fórmulas Hubbard
   */
  private getDefaultPlaybooks() {
    return [
      {
        condition: 'INEXISTENCIA',
        title: 'Fórmula de Inexistencia',
        steps: [
          'Encuentra una línea de comunicación',
          'Date a conocer',
          'Descubre lo que se necesita o se desea',
          'Hazlo, prodúcelo y/o preséntalo',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'PELIGRO',
        title: 'Fórmula de Peligro',
        steps: [
          'Pasa por alto (ignora al subordinado normalmente encargado y maneja la situación personalmente)',
          'Resuelve la situación y cualquier peligro que haya en ella',
          'Asigna al área una Condición de Peligro',
          'Asigna a cada individuo relacionado una Condición de Peligro Personal y asegúrate de que sigan la fórmula',
          'Reorganiza la actividad para que la situación no se repita',
          'Recomienda políticas firmes que detecten y/o impidan que se repita la condición',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'EMERGENCIA',
        title: 'Fórmula de Emergencia',
        steps: [
          'Promociona (Para un individuo: produce)',
          'Cambia tu forma de actuar',
          'Economiza',
          'Prepárate para entregar servicio',
          'Endurece la disciplina',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'NORMAL',
        title: 'Fórmula de Normal',
        steps: [
          'No cambies nada',
          'La ética es muy leve. El factor justicia es ligero y razonable',
          'Cada vez que una estadística mejore, examínala cuidadosamente y averigua qué la mejoró. Luego haz eso sin abandonar lo que estabas haciendo antes',
          'Cada vez que una estadística empeore ligeramente, encuentra rápidamente por qué y remédialo',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'AFLUENCIA',
        title: 'Fórmula de Afluencia de Acción',
        steps: [
          'Economiza en acciones dispersas o innecesarias. Elimina todo derroche',
          'Haz que toda acción cuente. Cada nueva acción debe contribuir y ser del mismo tipo que la que sí contribuyó',
          'Consolida todas las ganancias. No dejes que las cosas se relajen o decaigan',
          'Descubre por ti mismo qué fue lo que causó la Condición de Afluencia y refuérzalo',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'PODER',
        title: 'Fórmula de Poder',
        steps: ['No te desconectes', 'Deja por escrito tu propio puesto'],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'CAMBIO_DE_PODER',
        title: 'Fórmula de Cambio de Poder',
        steps: [
          'Cuando asumas un nuevo puesto no cambies nada hasta que te hayas familiarizado totalmente con tu nueva zona de poder',
          'Observa, pregunta y prepara una lista de qué tuvo éxito previamente en tu área o zona de control',
          'Observa y prepara una lista de todas aquellas cosas que no tuvieron éxito en tu área en el pasado',
          'Haz que se realicen las acciones de éxito',
          'Desecha las acciones sin éxito',
          'Deja de intentar arreglártelas como puedas o defenderte frenéticamente',
          'De manera sensata, vuelve a poner ahí una estructura funcional',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      {
        condition: 'SIN_DATOS',
        title: 'Condición Técnica: Sin Datos Suficientes',
        steps: [
          'Asegurar que el sistema de medición esté funcionando correctamente',
          'Verificar que se estén registrando datos de manera consistente',
          'Establecer un período mínimo de recolección de datos antes de evaluar',
          'Revisar la integridad de las fuentes de información',
          'Una vez disponibles datos suficientes, aplicar la evaluación correspondiente',
        ],
        version: 1,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
