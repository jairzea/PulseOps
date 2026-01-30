import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FormulaStepDto {
  @IsNumber()
  order: number;

  @IsString()
  description: string;

  @IsBoolean()
  enabled: boolean;
}

class FormulaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FormulaStepDto)
  steps?: FormulaStepDto[];
}

class AfluenciaThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormulaDto)
  formula?: FormulaDto;
}

class NormalThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsNumber()
  maxInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormulaDto)
  formula?: FormulaDto;
}

class EmergenciaThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsNumber()
  maxInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormulaDto)
  formula?: FormulaDto;
}

class PeligroThresholdsDto {
  @IsNumber()
  minInclination: number;

  @IsNumber()
  maxInclination: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormulaDto)
  formula?: FormulaDto;
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
  @Type(() => FormulaDto)
  formula?: FormulaDto;
}

class InexistenciaThresholdsDto {
  @IsNumber()
  threshold: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormulaDto)
  formula?: FormulaDto;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => FormulaDto)
  formula?: FormulaDto;

  @ValidateNested()
  @Type(() => SignalsThresholdsDto)
  signals: SignalsThresholdsDto;
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
