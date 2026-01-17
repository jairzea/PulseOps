import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metric, MetricDocument } from './schemas/metric.schema';
import { CreateMetricDto, UpdateMetricDto } from './dto/metric.dto';
import { RecordsService } from '../records/records.service';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Metric.name) private metricModel: Model<MetricDocument>,
    @Inject(forwardRef(() => RecordsService))
    private recordsService: RecordsService,
  ) {}

  async create(dto: CreateMetricDto, createdBy: string): Promise<Metric> {
    const metric = new this.metricModel({
      ...dto,
      createdBy,
    });
    return metric.save();
  }

  async findAll(): Promise<Metric[]> {
    return this.metricModel.find().exec();
  }

  async findByKey(key: string): Promise<Metric | null> {
    return this.metricModel.findOne({ key }).exec();
  }

  async update(id: string, dto: UpdateMetricDto): Promise<Metric | null> {
    return this.metricModel.findOneAndUpdate({ id }, dto, { new: true }).exec();
  }

  async findByResource(resourceId: string): Promise<Metric[]> {
    // Buscar métricas que tienen este recurso asociado
    const metricsWithResource = await this.metricModel
      .find({ resourceIds: resourceId })
      .exec();

    if (metricsWithResource.length > 0) {
      return metricsWithResource;
    }

    // Fallback: obtener métricas únicas que tiene este recurso (basado en records)
    const records = await this.recordsService.findByResource(resourceId);
    const metricKeys = [...new Set(records.map((r) => r.metricKey))];

    // Retornar solo las métricas que existen en records
    return this.metricModel.find({ key: { $in: metricKeys } }).exec();
  }
}
