import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class UpsertPlaybookDto {
  @IsEnum([
    'PODER',
    'CAMBIO_DE_PODER',
    'AFLUENCIA',
    'NORMAL',
    'EMERGENCIA',
    'PELIGRO',
    'INEXISTENCIA',
    'SIN_DATOS',
  ])
  condition: string;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  steps: string[];

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
