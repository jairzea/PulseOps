import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metric, MetricDocument } from './schemas/metric.schema';
import { CreateMetricDto, UpdateMetricDto } from './dto/metric.dto';
import { RecordsService } from '../records/records.service';
import {
  ResourceNotFoundException,
  DuplicateResourceException,
  DatabaseException,
} from '../common/exceptions/app.exception';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Metric.name) private metricModel: Model<MetricDocument>,
    @Inject(forwardRef(() => RecordsService))
    private recordsService: RecordsService,
  ) {}

  async create(dto: CreateMetricDto, createdBy: string): Promise<Metric> {
    try {
      // Verificar si ya existe una métrica con ese key
      const existing = await this.metricModel.findOne({ key: dto.key }).exec();
      if (existing) {
        throw new DuplicateResourceException('Métrica', 'key', dto.key);
      }

      const metric = new this.metricModel({
        ...dto,
        resourceIds: dto.resourceIds || [],
        createdBy,
      });
      return await metric.save();
    } catch (error) {
      if (error instanceof DuplicateResourceException) {
        throw error;
      }
      throw new DatabaseException('Error al crear la métrica', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findAll(): Promise<Metric[]> {
    try {
      return await this.metricModel.find().exec();
    } catch (error) {
      throw new DatabaseException('Error al obtener las métricas', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findByKey(key: string): Promise<Metric | null> {
    try {
      const metric = await this.metricModel.findOne({ key }).exec();
      if (!metric) {
        throw new ResourceNotFoundException('Métrica', key);
      }
      return metric;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Error al buscar la métrica', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async update(id: string, dto: UpdateMetricDto): Promise<Metric | null> {
    try {
      const updated = await this.metricModel
        .findOneAndUpdate({ id }, dto, { new: true })
        .exec();
      
      if (!updated) {
        throw new ResourceNotFoundException('Métrica', id);
      }
      
      return updated;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Error al actualizar la métrica', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const metric = await this.metricModel.findById(id).exec();
      
      if (!metric) {
        throw new ResourceNotFoundException('Métrica', id);
      }

      await this.metricModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Error al eliminar la métrica', {
        originalError: error instanceof Error ? error.message : String(error),
        metricId: id,
      });
    }
  }

  async findByResource(resourceId: string): Promise<Metric[]> {
    try {
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
      return await this.metricModel.find({ key: { $in: metricKeys } }).exec();
    } catch (error) {
      throw new DatabaseException('Error al buscar métricas por recurso', {
        originalError: error instanceof Error ? error.message : String(error),
        resourceId,
      });
    }
  }
}
