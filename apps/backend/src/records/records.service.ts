import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MetricRecord,
  MetricRecordDocument,
} from './schemas/metric-record.schema';
import { CreateRecordDto } from './dto/record.dto';

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

  async delete(id: string): Promise<boolean> {
    const result = await this.recordModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  async findByResource(resourceId: string): Promise<MetricRecord[]> {
    return this.recordModel.find({ resourceId }).exec();
  }
}
