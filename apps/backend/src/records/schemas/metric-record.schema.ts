import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MetricRecordDocument = MetricRecord & Document;

@Schema({ collection: 'records', timestamps: true })
export class MetricRecord {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true })
  resourceId: string;

  @Prop({ required: true })
  metricKey: string;

  @Prop({ required: true })
  week: string; // ISO week format "2026-W02"

  @Prop({ required: true })
  timestamp: string; // ISO date

  @Prop({ required: true, type: Number })
  value: number;

  @Prop({ default: 'manual' })
  source: string;

  @Prop({ required: true })
  createdBy: string;
}

export const MetricRecordSchema = SchemaFactory.createForClass(MetricRecord);

// Índice único para evitar duplicados
MetricRecordSchema.index(
  { resourceId: 1, metricKey: 1, week: 1 },
  { unique: true },
);

MetricRecordSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
