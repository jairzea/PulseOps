import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsEnum(['DEV', 'TL', 'OTHER'])
  roleType: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Relación con métricas (solo para frontend, se manejará en el servicio)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['DEV', 'TL', 'OTHER'])
  roleType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Relación con métricas (solo para frontend, se manejará en el servicio)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];
}
