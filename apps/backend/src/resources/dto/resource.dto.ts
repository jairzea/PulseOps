import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsEnum(['DEV', 'TL', 'OTHER'])
  roleType: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
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
}
