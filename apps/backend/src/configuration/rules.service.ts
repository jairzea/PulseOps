import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessRule } from './schemas/business-rule.schema';
import {
  CreateBusinessRuleDto,
  UpdateBusinessRuleDto,
} from './dto/business-rule.dto';

/**
 * Servicio de gestión de reglas de negocio
 */
@Injectable()
export class RulesService {
  constructor(
    @InjectModel(BusinessRule.name)
    private readonly ruleModel: Model<BusinessRule>,
  ) {}

  /**
   * Crear nueva regla
   */
  async createRule(dto: CreateBusinessRuleDto): Promise<BusinessRule> {
    const rule = new this.ruleModel(dto);
    return rule.save();
  }

  /**
   * Obtener todas las reglas
   */
  async getAllRules(activeOnly = false): Promise<BusinessRule[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return this.ruleModel
      .find(filter)
      .sort({ priority: 1, createdAt: -1 })
      .exec();
  }

  /**
   * Obtener regla por ID
   */
  async getRuleById(id: string): Promise<BusinessRule> {
    const rule = await this.ruleModel.findById(id).exec();

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    return rule;
  }

  /**
   * Actualizar regla (crea nueva versión)
   */
  async updateRule(
    id: string,
    dto: UpdateBusinessRuleDto,
  ): Promise<BusinessRule> {
    const currentRule = await this.getRuleById(id);

    // Crear nueva versión de la regla
    const newVersion = {
      ...currentRule.toObject(),
      ...dto,
      _id: undefined,
      version: currentRule.version + 1,
      previousVersionId: currentRule._id.toString(),
      createdAt: undefined,
      updatedAt: undefined,
    };

    // Desactivar versión anterior
    currentRule.isActive = false;
    await currentRule.save();

    // Crear nueva versión
    const newRule = new this.ruleModel(newVersion);
    return newRule.save();
  }

  /**
   * Eliminar regla (soft delete: marcar como inactiva)
   */
  async deleteRule(id: string): Promise<void> {
    const rule = await this.getRuleById(id);
    rule.isActive = false;
    await rule.save();
  }

  /**
   * Eliminar permanentemente (hard delete)
   */
  async permanentlyDeleteRule(id: string): Promise<void> {
    await this.ruleModel.findByIdAndDelete(id).exec();
  }

  /**
   * Activar/desactivar regla
   */
  async toggleRuleStatus(id: string, isActive: boolean): Promise<BusinessRule> {
    const rule = await this.getRuleById(id);
    rule.isActive = isActive;
    return rule.save();
  }

  /**
   * Obtener historial de versiones de una regla
   */
  async getRuleVersions(ruleId: string): Promise<BusinessRule[]> {
    const rule = await this.getRuleById(ruleId);
    const versions: BusinessRule[] = [rule];

    let currentVersionId = rule.previousVersionId;

    while (currentVersionId) {
      const previousVersion = await this.ruleModel
        .findById(currentVersionId)
        .exec();
      if (previousVersion) {
        versions.push(previousVersion);
        currentVersionId = previousVersion.previousVersionId;
      } else {
        break;
      }
    }

    return versions;
  }

  /**
   * Registrar disparo de regla
   */
  async recordTrigger(id: string): Promise<void> {
    await this.ruleModel
      .findByIdAndUpdate(id, {
        lastTriggered: new Date(),
        $inc: { triggerCount: 1 },
      })
      .exec();
  }

  /**
   * Obtener reglas aplicables a un recurso/métrica
   */
  async getApplicableRules(
    resourceId?: string,
    metricId?: string,
  ): Promise<BusinessRule[]> {
    const filter: any = { isActive: true };

    if (resourceId) {
      filter.$or = [{ resourceIds: { $size: 0 } }, { resourceIds: resourceId }];
    }

    if (metricId) {
      filter.$and = [
        {
          $or: [{ metricIds: { $size: 0 } }, { metricIds: metricId }],
        },
      ];
    }

    return this.ruleModel.find(filter).sort({ priority: 1 }).exec();
  }
}
