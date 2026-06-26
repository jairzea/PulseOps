import { IsString, IsOptional, IsArray, IsIn, IsObject } from 'class-validator';

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
  @IsIn(['PRODUCTION', 'STUDY', 'TRACKING'])
  category?: string;

  @IsOptional()
  @IsObject()
  categoryByResource?: Record<string, string>;

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
  @IsIn(['PRODUCTION', 'STUDY', 'TRACKING'])
  category?: string;

  @IsOptional()
  @IsObject()
  categoryByResource?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];
}
