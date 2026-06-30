import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type RepoProviderName = 'github' | 'bitbucket';

/**
 * Identidad de una persona en un proveedor de repos (para atribuir commits).
 */
export class RepoIdentityDto {
  @IsIn(['github', 'bitbucket'])
  provider: RepoProviderName;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string; // email con que aparece en los commits

  @IsBoolean()
  confirmed: boolean; // true = confirmada por admin; false = sugerida
}

/**
 * Alcance de repos que cuentan para una persona.
 */
export class RepoScopeDto {
  @IsBoolean()
  allRepos: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  repoIds?: string[];
}

/**
 * Payload para asociar/actualizar las identidades de repo de una persona.
 */
export class SetRepoIdentitiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepoIdentityDto)
  identities: RepoIdentityDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RepoScopeDto)
  scope?: RepoScopeDto;
}
