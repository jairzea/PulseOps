import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Tipos de operadores para reglas
 */
export enum RuleOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  BETWEEN = 'BETWEEN',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

/**
 * Expresión de regla
 */
@Schema({ _id: false })
class RuleExpression {
  @Prop({ required: true })
  field: string;

  @Prop({ required: true, enum: RuleOperator })
  operator: RuleOperator;

  @Prop({ type: Object, required: true })
  value: number | string | (number | string)[];
}

/**
 * Acción de regla
 */
@Schema({ _id: false })
class RuleAction {
  @Prop({ required: true, enum: ['ALERT', 'NOTIFY', 'ESCALATE', 'LOG'] })
  type: string;

  @Prop()
  target: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

/**
 * Documento de regla de negocio
 */
@Schema({ timestamps: true })
export class BusinessRule extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Alcance
  @Prop({ type: [String], default: [] })
  resourceIds: string[];

  @Prop({ type: [String], default: [] })
  metricIds: string[];

  // Lógica
  @Prop({ type: [RuleExpression], required: true })
  expressions: RuleExpression[];

  @Prop({ type: [RuleAction], required: true })
  actions: RuleAction[];

  // Control
  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 5 })
  priority: number;

  // Versionado
  @Prop({ required: true, default: 1 })
  version: number;

  @Prop()
  previousVersionId: string;

  // Metadata
  @Prop()
  createdBy: string;

  // Estadísticas
  @Prop()
  lastTriggered: Date;

  @Prop({ required: true, default: 0 })
  triggerCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const BusinessRuleSchema = SchemaFactory.createForClass(BusinessRule);
