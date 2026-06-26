import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Paso de una fórmula de condición (espejo de FormulaStep en shared-types).
 */
class FormulaStepDto {
  @IsNumber()
  order: number;

  @IsString()
  description: string;

  @IsBoolean()
  enabled: boolean;
}

/**
 * Fórmula de acción asociada a una condición (espejo de ConditionFormula).
 * Es informativa/configurable; el motor no la usa para calcular la condición.
 */
class ConditionFormulaDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormulaStepDto)
  steps: FormulaStepDto[];

  @IsBoolean()
  enabled: boolean;
}

class AfluenciaThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionFormulaDto)
  formula?: ConditionFormulaDto;
}

class NormalThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsNumber()
  maxInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionFormulaDto)
  formula?: ConditionFormulaDto;
}

class EmergenciaThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsNumber()
  maxInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionFormulaDto)
  formula?: ConditionFormulaDto;
}

class PeligroThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsNumber()
  maxInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionFormulaDto)
  formula?: ConditionFormulaDto;
}

class PoderThresholdsDto {
  @IsNumber()
  minConsecutivePeriods: number;

  @IsNumber()
  minInclination: number;

  @IsNumber()
  stabilityThreshold: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionFormulaDto)
  formula?: ConditionFormulaDto;
}

class InexistenciaThresholdsDto {
  @IsNumber()
  threshold: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionFormulaDto)
  formula?: ConditionFormulaDto;
}

class VolatilitySignalConfigDto {
  @IsNumber()
  minDirectionChanges: number;

  @IsNumber()
  minWindowSize: number;
}

class SlowDeclineSignalConfigDto {
  @IsNumber()
  minConsecutiveDeclines: number;

  @IsNumber()
  maxInclinationPerPeriod: number;
}

class DataGapsSignalConfigDto {
  @IsNumber()
  expectedDaysBetweenPoints: number;

  @IsNumber()
  toleranceDays: number;
}

class RecoverySpikeSignalConfigDto {
  @IsNumber()
  minPriorDeclines: number;

  @IsNumber()
  minRecoveryInclination: number;
}

class NoiseSignalConfigDto {
  @IsNumber()
  maxInclinationVariation: number;

  @IsNumber()
  minWindowSize: number;
}

class SignalsThresholdsDto {
  @ValidateNested()
  @Type(() => VolatilitySignalConfigDto)
  volatility: VolatilitySignalConfigDto;

  @ValidateNested()
  @Type(() => SlowDeclineSignalConfigDto)
  slowDecline: SlowDeclineSignalConfigDto;

  @ValidateNested()
  @Type(() => DataGapsSignalConfigDto)
  dataGaps: DataGapsSignalConfigDto;

  @ValidateNested()
  @Type(() => RecoverySpikeSignalConfigDto)
  recoverySpike: RecoverySpikeSignalConfigDto;

  @ValidateNested()
  @Type(() => NoiseSignalConfigDto)
  noise: NoiseSignalConfigDto;
}

/**
 * Umbrales de nivel del consolidado (Fase 2): ratio 0..1 → condición.
 */
class ConsolidatedLevelsDto {
  @IsNumber()
  poder: number;

  @IsNumber()
  afluencia: number;

  @IsNumber()
  normal: number;

  @IsNumber()
  emergencia: number;

  @IsNumber()
  peligro: number;
}

/**
 * Tabla de puntajes del consolidado (Fase 2). Todos los campos numéricos.
 */
class ConditionScoreTableDto {
  @IsNumber()
  PODER: number;

  @IsNumber()
  AFLUENCIA: number;

  @IsNumber()
  NORMAL: number;

  @IsNumber()
  EMERGENCIA: number;

  @IsNumber()
  PELIGRO: number;

  @IsNumber()
  INEXISTENCIA: number;

  @IsNumber()
  SIN_DATOS: number;

  @IsNumber()
  CAMBIO_DE_PODER: number;
}

class ConditionThresholdsDto {
  @ValidateNested()
  @Type(() => AfluenciaThresholdsDto)
  afluencia: AfluenciaThresholdsDto;

  @ValidateNested()
  @Type(() => NormalThresholdsDto)
  normal: NormalThresholdsDto;

  @ValidateNested()
  @Type(() => EmergenciaThresholdsDto)
  emergencia: EmergenciaThresholdsDto;

  @ValidateNested()
  @Type(() => PeligroThresholdsDto)
  peligro: PeligroThresholdsDto;

  @ValidateNested()
  @Type(() => PoderThresholdsDto)
  poder: PoderThresholdsDto;

  @ValidateNested()
  @Type(() => InexistenciaThresholdsDto)
  inexistencia: InexistenciaThresholdsDto;

  @ValidateNested()
  @Type(() => SignalsThresholdsDto)
  signals: SignalsThresholdsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionScoreTableDto)
  scoreTable?: ConditionScoreTableDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConsolidatedLevelsDto)
  consolidatedLevels?: ConsolidatedLevelsDto;

  @IsOptional()
  @IsNumber()
  defaultWindowSize?: number;
}

export class CreateAnalysisConfigurationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => ConditionThresholdsDto)
  thresholds: ConditionThresholdsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateAnalysisConfigurationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConditionThresholdsDto)
  thresholds?: ConditionThresholdsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
