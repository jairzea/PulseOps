import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MetricRecord,
  MetricRecordDocument,
} from './schemas/metric-record.schema';
import { CreateRecordDto } from './dto/record.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  PaginatedResponse,
  createPaginatedResponse,
} from '../common/interfaces/paginated-response.interface';

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel(MetricRecord.name)
    private recordModel: Model<MetricRecordDocument>,
  ) {}

  /**
   * Upsert: Crea o actualiza record basado en resourceId + metricKey + week
   */
  async upsert(dto: CreateRecordDto, createdBy: string): Promise<MetricRecord> {
    const { resourceId, metricKey, week } = dto;

    return this.recordModel
      .findOneAndUpdate(
        { resourceId, metricKey, week },
        { ...dto, createdBy },
        { upsert: true, new: true },
      )
      .exec();
  }

  async findMany(filters: {
    resourceId?: string;
    metricKey?: string;
    fromWeek?: string;
    toWeek?: string;
  }): Promise<MetricRecord[]> {
    const query: any = {};

    if (filters.resourceId) query.resourceId = filters.resourceId;
    if (filters.metricKey) query.metricKey = filters.metricKey;

    if (filters.fromWeek || filters.toWeek) {
      query.week = {};
      if (filters.fromWeek) query.week.$gte = filters.fromWeek;
      if (filters.toWeek) query.week.$lte = filters.toWeek;
    }

    return this.recordModel.find(query).sort({ timestamp: 1 }).exec();
  }

  /**
   * Listado paginado de records con búsqueda y filtros
   * @param paginationQuery - Parámetros de paginación
   * @param filters - Filtros adicionales (resourceId, metricKey, etc.)
   * @returns Response paginada con records
   */
  async findManyPaginated(
    paginationQuery: PaginationQueryDto,
    filters: {
      resourceId?: string;
      metricKey?: string;
      fromWeek?: string;
      toWeek?: string;
    } = {},
  ): Promise<PaginatedResponse<MetricRecord>> {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = 'timestamp',
      sortDir = 'desc',
    } = paginationQuery;

    // Construir filtros
    const query: any = {};
    if (filters.resourceId) query.resourceId = filters.resourceId;
    if (filters.metricKey) query.metricKey = filters.metricKey;

    if (filters.fromWeek || filters.toWeek) {
      query.week = {};
      if (filters.fromWeek) query.week.$gte = filters.fromWeek;
      if (filters.toWeek) query.week.$lte = filters.toWeek;
    }

    // Búsqueda por metricKey o week
    if (search) {
      query.$or = [
        { metricKey: { $regex: search, $options: 'i' } },
        { week: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * pageSize;
    const sortOrder = sortDir === 'asc' ? 1 : -1;

    const [data, totalItems] = await Promise.all([
      this.recordModel
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.recordModel.countDocuments(query).exec(),
    ]);

    return createPaginatedResponse(data, page, pageSize, totalItems);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.recordModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  async findByResource(resourceId: string): Promise<MetricRecord[]> {
    return this.recordModel.find({ resourceId }).exec();
  }
}
