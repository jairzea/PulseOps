import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Thresholds {
  STEEP_POSITIVE: number;
  MODERATE_POSITIVE: number;
  FLAT_UPPER: number;
  FLAT_LOWER: number;
  MODERATE_NEGATIVE: number;
  STEEP_NEGATIVE: number;
  CRITICAL_NEGATIVE: number;
}

export type MetricRuleConfigDocument = MetricRuleConfig & Document;

@Schema({ collection: 'rule_configs', timestamps: true })
export class MetricRuleConfig {
  @Prop({ type: String, default: () => uuidv4() })
  id: string;

  @Prop({ required: true })
  metricKey: string;

  @Prop({ required: true })
  version: number;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: 2 })
  windowSize: number;

  @Prop({ type: Object, required: true })
  thresholds: Thresholds;

  @Prop({ default: 3 })
  powerMinPeriods: number;

  @Prop({ default: 0.001 })
  zeroThreshold: number;

  @Prop({ required: true })
  createdBy: string;
}

export const MetricRuleConfigSchema =
  SchemaFactory.createForClass(MetricRuleConfig);

MetricRuleConfigSchema.set('toJSON', {
  transform: (doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
