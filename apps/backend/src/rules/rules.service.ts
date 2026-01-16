import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MetricRuleConfig,
  MetricRuleConfigDocument,
} from './schemas/metric-rule-config.schema';
import { CreateRuleDto } from './dto/rule.dto';

@Injectable()
export class RulesService {
  constructor(
    @InjectModel(MetricRuleConfig.name)
    private ruleModel: Model<MetricRuleConfigDocument>,
  ) {}

  async create(
    dto: CreateRuleDto,
    createdBy: string,
  ): Promise<MetricRuleConfig> {
    // Obtener última versión para este metricKey
    const lastVersion = await this.ruleModel
      .findOne({ metricKey: dto.metricKey })
      .sort({ version: -1 })
      .exec();

    const version = lastVersion ? lastVersion.version + 1 : 1;

    const rule = new this.ruleModel({
      ...dto,
      version,
      isActive: false, // Por defecto inactivo
      createdBy,
    });

    return rule.save();
  }

  async findByMetricKey(metricKey: string): Promise<MetricRuleConfig[]> {
    return this.ruleModel.find({ metricKey }).sort({ version: -1 }).exec();
  }

  async findActive(metricKey: string): Promise<MetricRuleConfig | null> {
    return this.ruleModel.findOne({ metricKey, isActive: true }).exec();
  }

  async activate(id: string): Promise<MetricRuleConfig | null> {
    const rule = await this.ruleModel.findOne({ id }).exec();
    if (!rule) return null;

    // Desactivar todas las versiones de esta metricKey
    await this.ruleModel
      .updateMany({ metricKey: rule.metricKey }, { isActive: false })
      .exec();

    // Activar esta versión
    return this.ruleModel
      .findOneAndUpdate({ id }, { isActive: true }, { new: true })
      .exec();
  }
}
