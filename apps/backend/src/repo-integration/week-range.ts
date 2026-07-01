/**
 * Cálculo de la ventana semanal del framework (jueves 00:00 → miércoles 23:59 GMT-5),
 * que es la semana que el skill `repository` usa para medir productividad.
 *
 * Devuelve un rango `since`/`until` en UTC (para las queries de la API) y la etiqueta
 * `YYYY-Www` que se usa como `week` en `MetricRecord` (misma forma que los seeds).
 */

export interface WeekWindow {
  week: string; // etiqueta "YYYY-Www"
  since: string; // ISO UTC inclusivo (jueves 00:00 GMT-5)
  until: string; // ISO UTC exclusivo (jueves siguiente 00:00 GMT-5)
}

const GMT5_MS = 5 * 60 * 60 * 1000; // Colombia: UTC-5 fijo (sin DST)
const DAY_MS = 24 * 60 * 60 * 1000;

/** Etiqueta de semana naive (compatible con los seeds): año + nº de semana del año. */
function weekLabel(d: Date): string {
  const year = d.getUTCFullYear();
  const week = Math.ceil(
    ((d.getTime() - Date.UTC(year, 0, 1)) / DAY_MS + 1) / 7,
  );
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Ventana de la semana que CONTIENE a `ref` (default: ahora). Si se corre el miércoles 6PM,
 * devuelve la semana jueves..miércoles en curso (la que está terminando ese día).
 *
 * ponytail: offset GMT-5 fijo (Colombia no tiene DST) y etiqueta de semana naive como los
 * seeds. Ceiling: cruces de año en la numeración de semana; upgrade path = ISO-8601 week real.
 */
export function currentWeekWindow(ref: Date = new Date()): WeekWindow {
  // Pasar a "hora local GMT-5" operando sobre el epoch desplazado.
  const local = new Date(ref.getTime() - GMT5_MS);
  const dow = local.getUTCDay(); // 0=Dom .. 4=Jue
  const sinceDaysBack = (dow - 4 + 7) % 7; // días desde el último jueves

  // Medianoche GMT-5 del jueves de inicio de semana.
  const localMidnight = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
  );
  const sinceLocal = localMidnight - sinceDaysBack * DAY_MS;

  // Volver a UTC sumando el offset.
  const sinceUtc = sinceLocal + GMT5_MS;
  const untilUtc = sinceUtc + 7 * DAY_MS;

  return {
    week: weekLabel(new Date(sinceLocal)),
    since: new Date(sinceUtc).toISOString(),
    until: new Date(untilUtc).toISOString(),
  };
}
