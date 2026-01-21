import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';

/**
 * DTO estándar para paginación y búsqueda en listados
 * Usar en todos los endpoints de tipo "list"
 *
 * Ejemplo de uso en controller:
 * @Get()
 * async findAll(@Query() query: PaginationQueryDto) {
 *   return this.service.findAllPaginated(query);
 * }
 */
export class PaginationQueryDto {
  /**
   * Página actual (1-indexed)
   * @default 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Tamaño de página (cantidad de items por página)
   * @default 10
   * @max 100
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  /**
   * Término de búsqueda (case-insensitive)
   * Se aplica a campos relevantes según la entidad
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Campo por el cual ordenar
   * El valor depende del modelo (ej: 'name', 'createdAt', etc.)
   */
  @IsOptional()
  @IsString()
  sortBy?: string;

  /**
   * Dirección del ordenamiento
   * @default 'asc'
   */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc' = 'asc';
}
