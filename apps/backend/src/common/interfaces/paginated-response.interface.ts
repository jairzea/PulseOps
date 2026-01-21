/**
 * Metadata de paginación estándar
 */
export interface PaginationMeta {
  /**
   * Página actual
   */
  page: number;

  /**
   * Tamaño de página
   */
  pageSize: number;

  /**
   * Total de items en la base de datos
   */
  totalItems: number;

  /**
   * Total de páginas calculado
   */
  totalPages: number;
}

/**
 * Response estándar para endpoints paginados
 *
 * Ejemplo de uso:
 *
 * @Get()
 * async findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<Resource>> {
 *   return this.resourcesService.findAllPaginated(query);
 * }
 */
export interface PaginatedResponse<T> {
  /**
   * Array de datos de la página actual
   */
  data: T[];

  /**
   * Metadata de paginación
   */
  meta: PaginationMeta;
}

/**
 * Helper para construir respuesta paginada
 *
 * @param data - Array de datos
 * @param page - Página actual
 * @param pageSize - Tamaño de página
 * @param totalItems - Total de items en DB
 * @returns Objeto con formato PaginatedResponse
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
}
