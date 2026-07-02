/**
 * Tarjeta de auto-vinculación de GitHub para el perfil del usuario (self-service).
 * Cualquier usuario autenticado conecta SU propia cuenta de un clic vía OAuth; la identidad
 * la devuelve GitHub (login canónico verificado), sin escribir nada a mano.
 */
import { useEffect, useState } from 'react';
import { repoIntegrationApi, RepoIdentity } from '../services/api/repoIntegrationApi';
import { recordsApi, Record as MetricRecord } from '../services/api/recordsApi';
import { showToast } from '../utils/toast';

const GithubIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A10.52 10.52 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
);

export function GithubConnectCard({ resourceId }: { resourceId?: string }) {
    const [identity, setIdentity] = useState<RepoIdentity | null>(null);
    const [records, setRecords] = useState<MetricRecord[]>([]);
    const [labels, setLabels] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    // Filtro + paginación de las métricas sincronizadas (server-side, para que escale).
    const [metricFilter, setMetricFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 8;

    useEffect(() => {
        void loadIdentityAndLabels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resourceId]);

    // Recarga la página de métricas cuando cambian filtro/página/recurso.
    useEffect(() => {
        void loadRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resourceId, metricFilter, page]);

    useEffect(() => {
        // Feedback al volver del callback de GitHub (?github=connected|error).
        const params = new URLSearchParams(window.location.search);
        const result = params.get('github');
        if (result === 'connected') {
            const newLogin = params.get('login') ?? '';
            const prev = localStorage.getItem('gh_prev_login');
            if (prev && newLogin && prev.toLowerCase() !== newLogin.toLowerCase()) {
                showToast(`Vinculaste "${newLogin}" (antes era "${prev}")`, 'info');
            } else {
                showToast(`GitHub vinculado: ${newLogin}`, 'success');
            }
            localStorage.removeItem('gh_prev_login');
            window.history.replaceState({}, '', window.location.pathname);
        } else if (result === 'error') {
            showToast('No se pudo vincular GitHub', 'error');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const loadIdentityAndLabels = async () => {
        setLoading(true);
        try {
            const me = await repoIntegrationApi.oauthMe();
            setIdentity(me.identity);
            const [catalog, qaCatalog] = await Promise.all([
                repoIntegrationApi.metricCatalog().catch(() => []),
                repoIntegrationApi.metricCatalog('QA').catch(() => []),
            ]);
            const labelMap: Record<string, string> = {};
            for (const c of [...catalog, ...qaCatalog]) labelMap[c.key] = c.label;
            setLabels(labelMap);
        } catch {
            // silencioso
        } finally {
            setLoading(false);
        }
    };

    /** Trae una página de métricas sincronizadas (source github) del recurso, server-side. */
    const loadRecords = async () => {
        if (!resourceId) return;
        try {
            const res = await recordsApi.getPaginated({
                resourceId,
                source: 'github',
                metricKey: metricFilter || undefined,
                page,
                pageSize,
                sortBy: 'week',
                sortDir: 'desc',
            });
            setRecords(res.data);
            setTotalPages(res.meta.totalPages || 1);
            setTotalItems(res.meta.totalItems || 0);
        } catch {
            setRecords([]);
        }
    };

    const connect = async () => {
        try {
            const { url, configured } = await repoIntegrationApi.oauthStart();
            if (!configured || !url) {
                showToast('La vinculación con GitHub no está configurada', 'error');
                return;
            }
            // Recordar la cuenta actual para avisar si al volver resulta distinta.
            if (identity?.username) localStorage.setItem('gh_prev_login', identity.username);
            window.location.href = url;
        } catch {
            showToast('No se pudo iniciar la vinculación', 'error');
        }
    };

    const disconnect = async () => {
        try {
            await repoIntegrationApi.oauthDisconnect();
            setIdentity(null);
            showToast('GitHub desvinculado', 'success');
        } catch {
            showToast('No se pudo desvincular', 'error');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Integraciones
                </h3>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500">Cargando…</p>
            ) : identity ? (
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm">
                        <p className="text-gray-900 dark:text-white font-medium">
                            Cuenta de GitHub vinculada
                        </p>
                        <p className="text-green-600 dark:text-green-400">✓ {identity.username}</p>
                    </div>
                    <button
                        onClick={disconnect}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                    >
                        Desvincular
                    </button>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Vincula tu cuenta de GitHub para que tus métricas de desarrollo se midan
                            automáticamente.
                        </p>
                        <button
                            onClick={connect}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 rounded-lg transition-opacity text-sm whitespace-nowrap"
                        >
                            <GithubIcon className="w-5 h-5" /> Conectar mi GitHub
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Se vinculará la cuenta con la que tengas sesión iniciada en GitHub. ¿Cuenta
                        equivocada?{' '}
                        <a
                            href="https://github.com/logout"
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            Cierra sesión en GitHub
                        </a>{' '}
                        y vuelve a conectar.
                    </p>
                </div>
            )}

            {/* Registros sincronizados desde el repo (para que el recurso confirme lo que se trajo). */}
            {(totalItems > 0 || metricFilter) && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Métricas sincronizadas{' '}
                            <span className="text-xs font-normal text-gray-500">· {totalItems} registros</span>
                        </p>
                        <select
                            value={metricFilter}
                            onChange={(e) => { setPage(1); setMetricFilter(e.target.value); }}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las métricas</option>
                            {Object.entries(labels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {records.map((r) => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-sm"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-900 dark:text-white font-mono text-xs">{r.metricKey}</span>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">{r.week}</span>
                                    </div>
                                    {labels[r.metricKey] && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {labels[r.metricKey]}
                                        </div>
                                    )}
                                </div>
                                <span className="text-gray-900 dark:text-white tabular-nums">{r.value}</span>
                            </div>
                        ))}
                    </div>
                    {records.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                            Sin registros para el filtro seleccionado.
                        </p>
                    )}
                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-600 dark:text-gray-400">
                            <span>Página {page} de {totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Datos traídos automáticamente desde tu repositorio (fuente: GitHub).
                    </p>
                </div>
            )}
        </div>
    );
}
