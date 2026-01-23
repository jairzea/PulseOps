import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HubbardCondition } from '@pulseops/shared-types';
import {
  ConditionMetadata,
  ConditionMetadataDocument,
} from './schemas/condition-metadata.schema';

export interface ConditionMetadataDto {
  condition: HubbardCondition;
  order: number;
  displayName: string;
  description: string;
  color: {
    bg: string;
    badge: string;
    text: string;
    border: string;
    glow: string;
  };
  icon: string;
  category: 'superior' | 'normal' | 'crisis' | 'technical';
}

@Injectable()
export class ConditionsService {
  constructor(
    @InjectModel(ConditionMetadata.name)
    private conditionMetadataModel: Model<ConditionMetadataDocument>,
  ) {
    // Inicializar metadata por defecto al arrancar
    this.initializeDefaultMetadata();
  }

  /**
   * Inicializa la metadata por defecto si no existe en la BD.
   */
  private async initializeDefaultMetadata(): Promise<void> {
    const count = await this.conditionMetadataModel.countDocuments();
    if (count === 0) {
      const defaults = this.getDefaultMetadata();
      await this.conditionMetadataModel.insertMany(defaults);
      console.log('✅ Metadata de condiciones inicializada');
    }
  }

  /**
   * Retorna metadata por defecto de las 8 condiciones Hubbard.
   */
  private getDefaultMetadata(): ConditionMetadataDto[] {
    return [
      {
        condition: 'PODER' as HubbardCondition,
        order: 1,
        displayName: 'Poder',
        description:
          'Estado operativo superior sostenido con estabilidad y alto rendimiento',
        color: {
          bg: 'bg-yellow-900/50',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
          text: 'text-yellow-300',
          border: 'border-yellow-500',
          glow: 'rgb(234, 179, 8)',
        },
        icon: '⚡',
        category: 'superior',
      },
      {
        condition: 'CAMBIO_DE_PODER' as HubbardCondition,
        order: 2,
        displayName: 'Cambio de Poder',
        description:
          'Transición de responsabilidad o estructura organizacional',
        color: {
          bg: 'bg-purple-900/50',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          text: 'text-purple-300',
          border: 'border-purple-500',
          glow: 'rgb(168, 85, 247)',
        },
        icon: '🔄',
        category: 'superior',
      },
      {
        condition: 'AFLUENCIA' as HubbardCondition,
        order: 3,
        displayName: 'Afluencia',
        description: 'Expansión acelerada con crecimiento pronunciado',
        color: {
          bg: 'bg-green-900/50',
          badge: 'bg-green-500/20 text-green-300 border-green-500/50',
          text: 'text-green-300',
          border: 'border-green-500',
          glow: 'rgb(34, 197, 94)',
        },
        icon: '📈',
        category: 'superior',
      },
      {
        condition: 'NORMAL' as HubbardCondition,
        order: 4,
        displayName: 'Normal',
        description:
          'Funcionamiento esperado con crecimiento positivo sostenido',
        color: {
          bg: 'bg-blue-900/50',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          text: 'text-blue-300',
          border: 'border-blue-500',
          glow: 'rgb(59, 130, 246)',
        },
        icon: '✅',
        category: 'normal',
      },
      {
        condition: 'EMERGENCIA' as HubbardCondition,
        order: 5,
        displayName: 'Emergencia',
        description: 'Estancamiento o descenso moderado que requiere atención',
        color: {
          bg: 'bg-orange-900/50',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
          text: 'text-orange-300',
          border: 'border-orange-500',
          glow: 'rgb(249, 115, 22)',
        },
        icon: '⚠️',
        category: 'crisis',
      },
      {
        condition: 'PELIGRO' as HubbardCondition,
        order: 6,
        displayName: 'Peligro',
        description: 'Deterioro pronunciado con descenso severo',
        color: {
          bg: 'bg-red-900/50',
          badge: 'bg-red-500/20 text-red-300 border-red-500/50',
          text: 'text-red-300',
          border: 'border-red-500',
          glow: 'rgb(239, 68, 68)',
        },
        icon: '🔴',
        category: 'crisis',
      },
      {
        condition: 'INEXISTENCIA' as HubbardCondition,
        order: 7,
        displayName: 'Inexistencia',
        description: 'Caída casi vertical o ausencia de actividad',
        color: {
          bg: 'bg-gray-900/50',
          badge: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
          text: 'text-gray-300',
          border: 'border-gray-500',
          glow: 'rgb(107, 114, 128)',
        },
        icon: '❌',
        category: 'crisis',
      },
      {
        condition: 'SIN_DATOS' as HubbardCondition,
        order: 8,
        displayName: 'Sin Datos',
        description: 'Datos insuficientes para evaluar condición',
        color: {
          bg: 'bg-gray-800/50',
          badge: 'bg-gray-600/20 text-gray-400 border-gray-600/50',
          text: 'text-gray-400',
          border: 'border-gray-600',
          glow: 'rgb(75, 85, 99)',
        },
        icon: '📊',
        category: 'technical',
      },
    ];
  }

  /**
   * Retorna metadata de todas las condiciones desde BD o defaults.
   */
  async getConditionsMetadata(): Promise<ConditionMetadataDto[]> {
    try {
      const stored = await this.conditionMetadataModel
        .find()
        .sort({ order: 1 })
        .lean()
        .exec();

      if (stored && stored.length > 0) {
        return stored.map((doc) => ({
          condition: doc.condition,
          order: doc.order,
          displayName: doc.displayName,
          description: doc.description,
          color: doc.color,
          icon: doc.icon,
          category: doc.category,
        }));
      }
    } catch (error) {
      console.error('Error loading conditions metadata from DB:', error);
    }

    // Fallback a defaults si hay error o no hay datos
    return this.getDefaultMetadata();
  }

  /**
   * Obtiene metadata de una condición específica.
   */
  async getConditionMetadata(
    condition: HubbardCondition,
  ): Promise<ConditionMetadataDto | undefined> {
    const all = await this.getConditionsMetadata();
    return all.find((c) => c.condition === condition);
  }

  /**
   * Actualiza el color glow de una condición específica.
   */
  async updateConditionColor(
    condition: HubbardCondition,
    glow: string,
  ): Promise<ConditionMetadataDto> {
    // Validar formato RGB
    const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
    if (!rgbRegex.test(glow)) {
      throw new NotFoundException('Invalid RGB format. Expected: rgb(r, g, b)');
    }

    // Buscar o crear el documento
    let doc = await this.conditionMetadataModel.findOne({ condition }).exec();

    if (!doc) {
      // Si no existe, crear con defaults
      const defaults = this.getDefaultMetadata();
      const defaultData = defaults.find((d) => d.condition === condition);
      if (!defaultData) {
        throw new NotFoundException(`Condition ${condition} not found`);
      }
      doc = new this.conditionMetadataModel(defaultData);
    }

    // Actualizar solo el glow
    doc.color.glow = glow;
    await doc.save();

    return {
      condition: doc.condition,
      order: doc.order,
      displayName: doc.displayName,
      description: doc.description,
      color: doc.color,
      icon: doc.icon,
      category: doc.category,
    };
  }
}
