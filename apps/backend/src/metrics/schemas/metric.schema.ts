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

  // Clasificación base para el consolidado (Fase 2). Default PRODUCTION.
  // - PRODUCTION: cuenta en el consolidado de la persona.
  // - STUDY: estudio; no cuenta en el consolidado.
  // - TRACKING: solo seguimiento; no cuenta ni como producción ni estudio.
  @Prop({ default: 'PRODUCTION', enum: ['PRODUCTION', 'STUDY', 'TRACKING'] })
  category: string;

  // Override de categoría por recurso: { [resourceId]: 'PRODUCTION'|'STUDY'|'TRACKING' }.
  // Para casos donde una métrica es producción en general pero no para cierto recurso.
  // Si no hay entrada para un recurso, aplica `category`.
  @Prop({ type: Object, default: {} })
  categoryByResource: Record<string, string>;

  @Prop({ type: [String], default: [] })
  resourceIds: string[];

  @Prop({ required: true })
  createdBy: string;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);

MetricSchema.set('toJSON', {
  transform: (doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return rest;
  },
});
