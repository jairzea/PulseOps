/**
 * Query Utils - Utilidades para construcción de query strings
 */

export type QueryParams = { [key: string]: unknown };

/**
 * Convierte objeto de params a query string
 * Omite valores undefined/null/empty
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
