import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateChartDto {
  @IsString()
  resourceId: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  metricKeys: string[];

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateChartDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricKeys?: string[];

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
