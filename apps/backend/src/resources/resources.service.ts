import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(dto: CreateResourceDto, createdBy: string): Promise<Resource> {
    const resource = new this.resourceModel({
      ...dto,
      createdBy,
    });
    return resource.save();
  }

  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().exec();
  }

  async findById(id: string): Promise<Resource | null> {
    return this.resourceModel.findOne({ id }).exec();
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource | null> {
    return this.resourceModel
      .findOneAndUpdate({ id }, dto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Resource | null> {
    return this.resourceModel.findOneAndDelete({ id }).exec();
  }
}
