import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetricPoint } from '@pulseops/shared-types';

class ThresholdsDto {
  @IsNumber()
  STEEP_POSITIVE: number;

  @IsNumber()
  MODERATE_POSITIVE: number;

  @IsNumber()
  FLAT_UPPER: number;

  @IsNumber()
  FLAT_LOWER: number;

  @IsNumber()
  MODERATE_NEGATIVE: number;

  @IsNumber()
  STEEP_NEGATIVE: number;

  @IsNumber()
  CRITICAL_NEGATIVE: number;
}

export class CreateRuleDto {
  @IsString()
  metricKey: string;

  @IsOptional()
  @IsNumber()
  windowSize?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ThresholdsDto)
  thresholds: ThresholdsDto;

  @IsOptional()
  @IsNumber()
  powerMinPeriods?: number;

  @IsOptional()
  @IsNumber()
  zeroThreshold?: number;
}

export class SimulateRuleDto {
  @IsString()
  metricKey: string;

  @IsObject()
  series: {
    metricId: string;
    points: MetricPoint[];
  };

  @IsOptional()
  @IsObject()
  configOverride?: {
    windowSize?: number;
    thresholds?: ThresholdsDto;
    powerMinPeriods?: number;
    zeroThreshold?: number;
  };
}
