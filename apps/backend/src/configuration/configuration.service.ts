import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalysisConfiguration } from './schemas/analysis-configuration.schema';
import {
  CreateAnalysisConfigurationDto,
  UpdateAnalysisConfigurationDto,
} from './dto/analysis-configuration.dto';

/**
 * Servicio de gestión de configuraciones de análisis
 */
@Injectable()
export class ConfigurationService {
  constructor(
    @InjectModel(AnalysisConfiguration.name)
    private readonly configModel: Model<AnalysisConfiguration>,
  ) {}

  /**
   * Crear una nueva configuración
   * Si se marca como activa, desactiva las demás
   */
  async createConfiguration(
    dto: CreateAnalysisConfigurationDto,
  ): Promise<AnalysisConfiguration> {
    if (dto.isActive) {
      await this.configModel.updateMany({}, { isActive: false });
    }

    const config = new this.configModel(dto);
    return config.save();
  }

  /**
   * Obtener todas las configuraciones
   */
  async getAllConfigurations(): Promise<AnalysisConfiguration[]> {
    return this.configModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Obtener configuración activa
   */
  async getActiveConfiguration(): Promise<AnalysisConfiguration> {
    const config = await this.configModel.findOne({ isActive: true }).exec();

    if (!config) {
      // Si no hay configuración activa, crear una con valores por defecto
      return this.createDefaultConfiguration();
    }

    return config;
  }

  /**
   * Obtener configuración por ID
   */
  async getConfigurationById(id: string): Promise<AnalysisConfiguration> {
    const config = await this.configModel.findById(id).exec();

    if (!config) {
      throw new NotFoundException(`Configuration with ID ${id} not found`);
    }

    return config;
  }

  /**
   * Actualizar configuración
   */
  async updateConfiguration(
    id: string,
    dto: UpdateAnalysisConfigurationDto,
  ): Promise<AnalysisConfiguration> {
    const config = await this.getConfigurationById(id);

    // Si se activa esta configuración, desactivar las demás
    if (dto.isActive) {
      await this.configModel.updateMany(
        { _id: { $ne: id } },
        { isActive: false },
      );
    }

    // Incrementar versión si se modifican los umbrales
    if (dto.thresholds) {
      config.version += 1;
    }

    Object.assign(config, dto);
    return config.save();
  }

  /**
   * Eliminar configuración
   */
  async deleteConfiguration(id: string): Promise<void> {
    const config = await this.getConfigurationById(id);

    if (config.isActive) {
      throw new BadRequestException('Cannot delete active configuration');
    }

    await this.configModel.findByIdAndDelete(id).exec();
  }

  /**
   * Activar una configuración específica
   */
  async activateConfiguration(id: string): Promise<AnalysisConfiguration> {
    await this.configModel.updateMany({}, { isActive: false });

    const config = await this.getConfigurationById(id);
    config.isActive = true;

    return config.save();
  }

  /**
   * Crear configuración por defecto
   */
  private async createDefaultConfiguration(): Promise<AnalysisConfiguration> {
    const defaultConfig: CreateAnalysisConfigurationDto = {
      name: 'Configuración por defecto',
      description:
        'Configuración inicial con umbrales estándar basados en las fórmulas de Hubbard',
      isActive: true,
      thresholds: {
        afluencia: {
          minInclination: 50,
          formula: {
            name: 'Fórmula de Afluencia',
            description: 'Pasos para gestionar crecimiento pronunciado',
            enabled: true,
            steps: [
              {
                order: 1,
                description:
                  'Economiza - No compromisos futuros en compras o contratación',
                enabled: true,
              },
              {
                order: 2,
                description: 'Paga todas las facturas y deudas pendientes',
                enabled: true,
              },
              {
                order: 3,
                description: 'Invierte el resto en recursos para dar servicio',
                enabled: true,
              },
              {
                order: 4,
                description: 'Descubre qué causó la Afluencia y refuérzalo',
                enabled: true,
              },
            ],
          },
        },
        normal: {
          minInclination: 5,
          maxInclination: 50,
          formula: {
            name: 'Fórmula de Normal',
            description: 'Pasos para mantener crecimiento gradual habitual',
            enabled: true,
            steps: [
              {
                order: 1,
                description: 'No cambies nada - mantén lo que funciona',
                enabled: true,
              },
              {
                order: 2,
                description: 'Ética leve y justicia razonable',
                enabled: true,
              },
              {
                order: 3,
                description:
                  'Cuando mejore una estadística, averigua qué la mejoró y hazlo más',
                enabled: true,
              },
              {
                order: 4,
                description:
                  'Cuando empeore, encuentra rápidamente por qué y remédialo',
                enabled: true,
              },
            ],
          },
        },
        emergencia: {
          minInclination: -5,
          maxInclination: 5,
          formula: {
            name: 'Fórmula de Emergencia',
            description: 'Pasos para recuperarse de estancamiento',
            enabled: true,
            steps: [
              {
                order: 1,
                description: 'Promociona (para individual: Produce)',
                enabled: true,
              },
              {
                order: 2,
                description: 'Cambia tu forma de actuar',
                enabled: true,
              },
              { order: 3, description: 'Economiza en recursos', enabled: true },
              {
                order: 4,
                description: 'Prepárate para entregar servicio',
                enabled: true,
              },
              {
                order: 5,
                description: 'Endurece la disciplina',
                enabled: true,
              },
            ],
          },
        },
        peligro: {
          minInclination: -80,
          maxInclination: -50,
          formula: {
            name: 'Fórmula de Peligro',
            description: 'Pasos para recuperarse de caída pronunciada',
            enabled: true,
            steps: [
              {
                order: 1,
                description:
                  'Pasa por alto - Ignora rutinas normales y maneja personalmente',
                enabled: true,
              },
              {
                order: 2,
                description:
                  'Resuelve la situación y cualquier peligro inmediato',
                enabled: true,
              },
              {
                order: 3,
                description: 'Asigna Condición de Peligro al área afectada',
                enabled: true,
              },
              {
                order: 4,
                description:
                  'Pon en orden tu ética personal y usa autodisciplina',
                enabled: true,
              },
              {
                order: 5,
                description: 'Reorganiza para que la situación no se repita',
                enabled: true,
              },
              {
                order: 6,
                description:
                  'Formula política que detecte e impida la recurrencia',
                enabled: true,
              },
            ],
          },
        },
        poder: {
          minConsecutivePeriods: 3,
          minInclination: -5,
          stabilityThreshold: 0.1,
          formula: {
            name: 'Fórmula de Poder',
            description: 'Pasos para mantener Normal en nivel estelar',
            enabled: true,
            steps: [
              {
                order: 1,
                description: 'No te desconectes - Mantén el nivel alcanzado',
                enabled: true,
              },
              {
                order: 2,
                description:
                  'Deja por escrito tu propio puesto y responsabilidades',
                enabled: true,
              },
            ],
          },
        },
        inexistencia: {
          threshold: 0.01,
          formula: {
            name: 'Fórmula de Inexistencia',
            description:
              'Pasos para establecer existencia desde cero o colapso',
            enabled: true,
            steps: [
              {
                order: 1,
                description: 'Encuentra una línea de comunicación',
                enabled: true,
              },
              { order: 2, description: 'Date a conocer', enabled: true },
              {
                order: 3,
                description: 'Descubre lo que se necesita o se desea',
                enabled: true,
              },
              {
                order: 4,
                description: 'Hazlo, prodúcelo y/o preséntalo',
                enabled: true,
              },
            ],
          },
        },
        signals: {
          volatility: {
            minDirectionChanges: 3,
            minWindowSize: 5,
          },
          slowDecline: {
            minConsecutiveDeclines: 3,
            maxInclinationPerPeriod: -5,
          },
          dataGaps: {
            expectedDaysBetweenPoints: 7,
            toleranceDays: 2,
          },
          recoverySpike: {
            minPriorDeclines: 2,
            minRecoveryInclination: 50,
          },
          noise: {
            maxInclinationVariation: 5,
            minWindowSize: 4,
          },
        },
      },
    };

    return this.createConfiguration(defaultConfig);
  }
}
