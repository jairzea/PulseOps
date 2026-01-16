import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chart, ChartDocument } from './schemas/chart.schema';
import { CreateChartDto, UpdateChartDto } from './dto/chart.dto';

@Injectable()
export class ChartsService {
  constructor(
    @InjectModel(Chart.name) private chartModel: Model<ChartDocument>,
  ) {}

  async create(dto: CreateChartDto, createdBy: string): Promise<Chart> {
    const chart = new this.chartModel({
      ...dto,
      createdBy,
    });
    return chart.save();
  }

  async findAll(resourceId?: string): Promise<Chart[]> {
    const filter = resourceId ? { resourceId } : {};
    return this.chartModel.find(filter).sort({ order: 1 }).exec();
  }

  async findById(id: string): Promise<Chart | null> {
    return this.chartModel.findOne({ id }).exec();
  }

  async update(id: string, dto: UpdateChartDto): Promise<Chart | null> {
    return this.chartModel.findOneAndUpdate({ id }, dto, { new: true }).exec();
  }
}
