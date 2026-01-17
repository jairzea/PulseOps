import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ResourceDocument = Resource & Document;

@Schema({ collection: 'resources', timestamps: true })
export class Resource {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['DEV', 'TL', 'OTHER'] })
  roleType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  metricIds: string[];

  @Prop({ required: true })
  createdBy: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Usar 'id' como identificador en vez de '_id'
ResourceSchema.set('toJSON', {
  transform: (doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
