import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema de umbrales de condiciones
 */
@Schema({ _id: false })
class AfluenciaThresholds {
  @Prop({ required: true, default: 50 })
  minInclination: number;
}

@Schema({ _id: false })
class NormalThresholds {
  @Prop({ required: true, default: 5 })
  minInclination: number;

  @Prop({ required: true, default: 50 })
  maxInclination: number;
}

@Schema({ _id: false })
class EmergenciaThresholds {
  @Prop({ required: true, default: -5 })
  minInclination: number;

  @Prop({ required: true, default: 5 })
  maxInclination: number;
}

@Schema({ _id: false })
class PeligroThresholds {
  @Prop({ required: true, default: -80 })
  minInclination: number;

  @Prop({ required: true, default: -50 })
  maxInclination: number;
}

@Schema({ _id: false })
class PoderThresholds {
  @Prop({ required: true, default: 3 })
  minConsecutivePeriods: number;

  @Prop({ required: true, default: -5 })
  minInclination: number;

  @Prop({ required: true, default: 0.1 })
  stabilityThreshold: number;
}

@Schema({ _id: false })
class InexistenciaThresholds {
  @Prop({ required: true, default: 0.01 })
  threshold: number;
}

@Schema({ _id: false })
class FormulaStep {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: true })
  enabled: boolean;
}

@Schema({ _id: false })
class Formula {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ type: [FormulaStep], default: [] })
  steps: FormulaStep[];
}

@Schema({ _id: false })
class VolatilitySignalConfig {
  @Prop({ required: true, default: 3 })
  minDirectionChanges: number;

  @Prop({ required: true, default: 5 })
  minWindowSize: number;
}

@Schema({ _id: false })
class SlowDeclineSignalConfig {
  @Prop({ required: true, default: 3 })
  minConsecutiveDeclines: number;

  @Prop({ required: true, default: -5 })
  maxInclinationPerPeriod: number;
}

@Schema({ _id: false })
class DataGapsSignalConfig {
  @Prop({ required: true, default: 7 })
  expectedDaysBetweenPoints: number;

  @Prop({ required: true, default: 2 })
  toleranceDays: number;
}

@Schema({ _id: false })
class RecoverySpikeSignalConfig {
  @Prop({ required: true, default: 2 })
  minPriorDeclines: number;

  @Prop({ required: true, default: 50 })
  minRecoveryInclination: number;
}

@Schema({ _id: false })
class NoiseSignalConfig {
  @Prop({ required: true, default: 5 })
  maxInclinationVariation: number;

  @Prop({ required: true, default: 4 })
  minWindowSize: number;
}

@Schema({ _id: false })
class SignalsThresholds {
  @Prop({ type: VolatilitySignalConfig, required: true })
  volatility: VolatilitySignalConfig;

  @Prop({ type: SlowDeclineSignalConfig, required: true })
  slowDecline: SlowDeclineSignalConfig;

  @Prop({ type: DataGapsSignalConfig, required: true })
  dataGaps: DataGapsSignalConfig;

  @Prop({ type: RecoverySpikeSignalConfig, required: true })
  recoverySpike: RecoverySpikeSignalConfig;

  @Prop({ type: NoiseSignalConfig, required: true })
  noise: NoiseSignalConfig;
}

@Schema({ _id: false })
class ConditionThresholds {
  @Prop({ type: AfluenciaThresholds, required: true })
  afluencia: AfluenciaThresholds;

  @Prop({ type: NormalThresholds, required: true })
  normal: NormalThresholds;

  @Prop({ type: EmergenciaThresholds, required: true })
  emergencia: EmergenciaThresholds;

  @Prop({ type: PeligroThresholds, required: true })
  peligro: PeligroThresholds;

  @Prop({ type: PoderThresholds, required: true })
  poder: PoderThresholds;

  @Prop({ type: InexistenciaThresholds, required: true })
  inexistencia: InexistenciaThresholds;

  // Opcional: fórmulas por condición
  @Prop({ type: Formula, required: false })
  formula?: Formula;

  @Prop({ type: SignalsThresholds, required: true })
  signals: SignalsThresholds;
}

/**
 * Documento de configuración del motor de análisis
 */
@Schema({ timestamps: true })
export class AnalysisConfiguration extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: ConditionThresholds, required: true })
  thresholds: ConditionThresholds;

  @Prop({ required: true, default: false })
  isActive: boolean;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop()
  createdBy: string;

  createdAt: Date;
  updatedAt: Date;
}

export const AnalysisConfigurationSchema = SchemaFactory.createForClass(
  AnalysisConfiguration,
);
