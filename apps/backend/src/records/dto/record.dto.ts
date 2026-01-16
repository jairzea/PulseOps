import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  resourceId: string;

  @IsString()
  metricKey: string;

  @IsString()
  week: string;

  @IsString()
  timestamp: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  source?: string;
}

export class QueryRecordsDto {
  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  metricKey?: string;

  @IsOptional()
  @IsString()
  fromWeek?: string;

  @IsOptional()
  @IsString()
  toWeek?: string;
}
