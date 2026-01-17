import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateMetricDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  periodType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];
}

export class UpdateMetricDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  periodType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];
}
