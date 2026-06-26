import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

const CONDITIONS = [
  'PODER',
  'CAMBIO_DE_PODER',
  'AFLUENCIA',
  'NORMAL',
  'EMERGENCIA',
  'PELIGRO',
  'INEXISTENCIA',
  'SIN_DATOS',
] as const;

export class NotifyConditionDto {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsIn(CONDITIONS)
  condition: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsIn(['metric', 'consolidated'])
  kind?: 'metric' | 'consolidated';
}
