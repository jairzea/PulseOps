import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    @Inject(forwardRef(() => MetricsService))
    private metricsService: MetricsService,
  ) {}

  async create(dto: CreateResourceDto, createdBy: string): Promise<Resource> {
    const resource = new this.resourceModel({
      name: dto.name,
      roleType: dto.roleType,
      isActive: dto.isActive ?? true,
      createdBy,
    });
    const savedResource = await resource.save();

    // Actualizar las métricas asociadas (fuente única de verdad)
    if (dto.metricIds && dto.metricIds.length > 0) {
      await this.updateMetricsRelation(savedResource.id, dto.metricIds);
    }

    return savedResource;
  }

  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().exec();
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resourceModel.findOne({ id }).exec();
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource | null> {
    const updated = await this.resourceModel
      .findOneAndUpdate(
        { id },
        {
          name: dto.name,
          roleType: dto.roleType,
          isActive: dto.isActive,
        },
        { new: true },
      )
      .exec();

    // Actualizar las métricas asociadas si se proporcionaron
    if (dto.metricIds !== undefined) {
      await this.updateMetricsRelation(id, dto.metricIds);
    }

    return updated;
  }

  async remove(id: string): Promise<Resource | null> {
    const deleted = await this.resourceModel.findOneAndDelete({ id }).exec();

    // Limpiar referencias en métricas
    if (deleted) {
      await this.updateMetricsRelation(id, []);
    }

    return deleted;
  }

  /**
   * Método privado para actualizar la relación en métricas (fuente única de verdad)
   */
  private async updateMetricsRelation(
    resourceId: string,
    metricIds: string[],
  ): Promise<void> {
    // Obtener todas las métricas
    const allMetrics = await this.metricsService.findAll();

    // Actualizar cada métrica
    for (const metric of allMetrics) {
      const hasResource = metric.resourceIds?.includes(resourceId) || false;
      const shouldHaveResource = metricIds.includes(metric.id);

      if (shouldHaveResource && !hasResource) {
        // Agregar recurso a la métrica
        const updatedResourceIds = [...(metric.resourceIds || []), resourceId];
        await this.metricsService.update(metric.id, {
          resourceIds: updatedResourceIds,
        });
      } else if (!shouldHaveResource && hasResource) {
        // Remover recurso de la métrica
        const updatedResourceIds = (metric.resourceIds || []).filter(
          (rid) => rid !== resourceId,
        );
        await this.metricsService.update(metric.id, {
          resourceIds: updatedResourceIds,
        });
      }
    }
  }
}
