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
        },
        normal: {
          minInclination: 5,
          maxInclination: 50,
        },
        emergencia: {
          minInclination: -5,
          maxInclination: 5,
        },
        peligro: {
          minInclination: -80,
          maxInclination: -50,
        },
        poder: {
          minConsecutivePeriods: 3,
          minInclination: -5,
          stabilityThreshold: 0.1,
        },
        inexistencia: {
          threshold: 0.01,
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
