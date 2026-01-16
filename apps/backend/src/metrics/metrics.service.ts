import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Metric, MetricDocument } from './schemas/metric.schema';
import { CreateMetricDto, UpdateMetricDto } from './dto/metric.dto';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Metric.name) private metricModel: Model<MetricDocument>,
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
}
