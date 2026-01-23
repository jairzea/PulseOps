import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ChartDocument = Chart & Document;

@Schema({ collection: 'charts', timestamps: true })
export class Chart {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true })
  resourceId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  metricKeys: string[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  createdBy: string;
}

export const ChartSchema = SchemaFactory.createForClass(Chart);

ChartSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
