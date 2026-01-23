import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MetricDocument = Metric & Document;

@Schema({ collection: 'metrics', timestamps: true })
export class Metric {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  label: string;

  @Prop()
  description?: string;

  @Prop()
  unit?: string;

  @Prop({ default: 'WEEK' })
  periodType: string;

  @Prop({ type: [String], default: [] })
  resourceIds: string[];

  @Prop({ required: true })
  createdBy: string;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);

MetricSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
