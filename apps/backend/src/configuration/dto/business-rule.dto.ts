import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RuleOperator } from '../schemas/business-rule.schema';

class RuleExpressionDto {
  @IsString()
  field: string;

  @IsEnum(RuleOperator)
  operator: RuleOperator;

  @IsOptional()
  value: number | string | (number | string)[];
}

class RuleActionDto {
  @IsEnum(['ALERT', 'NOTIFY', 'ESCALATE', 'LOG'])
  type: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsString()
  message: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class CreateBusinessRuleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleExpressionDto)
  expressions: RuleExpressionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  actions: RuleActionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateBusinessRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleExpressionDto)
  expressions?: RuleExpressionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  actions?: RuleActionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number;
}
