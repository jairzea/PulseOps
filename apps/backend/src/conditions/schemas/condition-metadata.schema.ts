import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HubbardCondition } from '@pulseops/shared-types';

export type ConditionMetadataDocument = ConditionMetadata & Document;

@Schema({ collection: 'condition_metadata' })
export class ConditionMetadata {
  @Prop({ required: true, unique: true, type: String })
  condition: HubbardCondition;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: {
      bg: String,
      badge: String,
      text: String,
      border: String,
    },
    required: true,
  })
  color: {
    bg: string;
    badge: string;
    text: string;
    border: string;
  };

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  category: 'superior' | 'normal' | 'crisis' | 'technical';

  @Prop({ default: true })
  isActive: boolean;
}

export const ConditionMetadataSchema =
  SchemaFactory.createForClass(ConditionMetadata);
