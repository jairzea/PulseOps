import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpsertPlaybookDto {
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
