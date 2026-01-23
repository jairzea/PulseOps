import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsIn(['DEV', 'TL', 'OTHER'])
  roleType?: 'DEV' | 'TL' | 'OTHER';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];

  @IsOptional()
  resourceProfile?: Record<string, any>;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['DEV', 'TL', 'OTHER'])
  roleType?: 'DEV' | 'TL' | 'OTHER';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];
}
