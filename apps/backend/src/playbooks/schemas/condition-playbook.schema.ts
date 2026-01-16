import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConditionPlaybookDocument = HydratedDocument<ConditionPlaybook>;

/**
 * Condiciones operativas Hubbard (debe coincidir con shared-types)
 */
export type HubbardCondition =
  | 'PODER'
  | 'CAMBIO_DE_PODER'
  | 'AFLUENCIA'
  | 'NORMAL'
  | 'EMERGENCIA'
  | 'PELIGRO'
  | 'INEXISTENCIA'
  | 'SIN_DATOS';

@Schema({ collection: 'condition_playbooks', timestamps: true })
export class ConditionPlaybook {
  @Prop({
    required: true,
    unique: true,
    enum: [
      'PODER',
      'CAMBIO_DE_PODER',
      'AFLUENCIA',
      'NORMAL',
      'EMERGENCIA',
      'PELIGRO',
      'INEXISTENCIA',
      'SIN_DATOS',
    ],
  })
  condition: HubbardCondition;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  steps: string[];

  @Prop({ default: 1 })
  version: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  updatedAt: string;
}

export const ConditionPlaybookSchema =
  SchemaFactory.createForClass(ConditionPlaybook);
