/**
 * OverviewPage — Panorama operativo del equipo.
 *
 * Muestra, de un vistazo, cuántas personas hay en cada condición operativa
 * (PODER, AFLUENCIA, NORMAL, EMERGENCIA, PELIGRO, INEXISTENCIA) y el detalle por
 * persona. El cálculo lo hace el backend en una sola llamada (`/analysis/overview`),
 * reutilizando el mismo motor del dashboard.
 */
import { useEffect, useState } from 'react';
import { useConditionsMetadata } from '../hooks/useConditionsMetadata';
import { analysisApi, TeamOverview } from '../services/api/analysisApi';
import { PageHeader } from '../components/PageHeader';
import { PulseLoader } from '../components/PulseLoader';
import { PermissionFeedback } from '../components/PermissionFeedback';

const ROLE_LABELS: Record<string, string> = {
  DEV: 'Desarrollador',
  TL: 'Líder Técnico',
  OTHER: 'Otro',
};

export function OverviewPage() {
  const { conditions, loading: loadingMeta } = useConditionsMetadata();
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analysisApi.getOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el panorama');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Condiciones operativas a mostrar como tarjetas (excluye técnicas tipo SIN_DATOS).
  const operationalConditions = conditions.filter(
    (c) => c.condition !== 'SIN_DATOS' && c.condition !== 'CAMBIO_DE_PODER',
  );

  const metaFor = (condition: string) =>
    conditions.find((c) => c.condition === condition);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Panorama del Equipo"
          description="Condición operativa de producción de cada persona, de un vistazo"
          action={{ label: 'Actualizar', onClick: load }}
        />

        {(loading || loadingMeta) && (
          <div className="py-16">
            <PulseLoader size="lg" variant="primary" text="Analizando al equipo..." />
          </div>
        )}

        {error && !loading && (
          <PermissionFeedback message={error} onRetry={load} />
        )}

        {!loading && !loadingMeta && overview && (
          <>
            {/* Resumen */}
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              {overview.evaluated} de {overview.totalResources} recursos con datos analizables
            </div>

            {/* Tarjetas de conteo por condición */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {operationalConditions.map((meta) => {
                const count = overview.byCondition[meta.condition] ?? 0;
                const active = count > 0;
                return (
                  <div
                    key={meta.condition}
                    className={`rounded-xl p-5 border-2 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                      active
                        ? `${meta.color.bg} ${meta.color.border}`
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    }`}
                    style={{
                      boxShadow:
                        active && meta.color.glow
                          ? `0 0 24px ${meta.color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.35)')}`
                          : 'none',
                    }}
                  >
                    <div className="text-2xl mb-1">{meta.icon}</div>
                    <div
                      className={`text-4xl font-extrabold ${active ? meta.color.text : 'text-gray-400 dark:text-gray-600'}`}
                    >
                      {count}
                    </div>
                    <div
                      className={`mt-1 text-xs font-semibold uppercase tracking-wide ${active ? meta.color.text : 'text-gray-500 dark:text-gray-500'}`}
                    >
                      {meta.displayName}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detalle por persona */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">Persona</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">Métrica</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">Inclinación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {overview.resources.map((r) => {
                    const meta = r.condition ? metaFor(r.condition) : undefined;
                    return (
                      <tr key={r.resourceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{r.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{ROLE_LABELS[r.roleType] ?? r.roleType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{r.metricKey ?? '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {r.inclination == null ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className={r.inclination > 0 ? 'text-green-600 dark:text-green-400' : r.inclination < 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}>
                              {r.inclination > 0 ? '+' : ''}{r.inclination.toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {r.condition ? (
                            <span
                              className="px-3 py-1 text-xs font-semibold rounded-full"
                              style={
                                meta
                                  ? { background: meta.color.glow.replace('rgb(', 'rgba(').replace(')', ', 0.15)'), color: meta.color.glow }
                                  : undefined
                              }
                            >
                              {meta?.displayName ?? r.condition}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Sin datos</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
