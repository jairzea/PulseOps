/**
 * Integraciones — asociación persona ↔ cuenta de GitHub + sincronización de métricas.
 * Solo admin. v1: GitHub. Las métricas sincronizadas se persisten como MetricRecord y
 * alimentan el análisis/consolidado existente.
 */
import { useEffect, useState } from 'react';
import { showToast } from '../utils/toast';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/SearchInput';
import { PaginationControls } from '../components/PaginationControls';
import { usePagination } from '../hooks/usePagination';
import type { PaginationMeta } from '../types/pagination';
import { authAPI } from '../services/authService';
import { UserWithMetadata } from '../types/auth';
import {
    repoIntegrationApi,
    IntegrationStatus,
    SyncRunResult,
} from '../services/api/repoIntegrationApi';
import { tid } from '../utils/testId';

/** Logo de GitHub (SVG oficial simplificado). */
const GithubIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A10.52 10.52 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
);

interface PersonRow {
    resourceId: string;
    name: string;
    email: string;
    username: string;
    identityEmail: string;
    confirmed: boolean;
    verified?: { login: string; name: string | null; avatarUrl: string; htmlUrl: string } | null;
    verifying?: boolean;
}

export function IntegrationsPage() {
    const [status, setStatus] = useState<IntegrationStatus | null>(null);
    const [rows, setRows] = useState<PersonRow[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0 });
    const [lastRun, setLastRun] = useState<SyncRunResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [ghMenuOpen, setGhMenuOpen] = useState(false);
    const pagination = usePagination(10);

    useEffect(() => {
        void handleInstallCallback();
    }, []);

    // Recarga la página de personas cuando cambian paginación/búsqueda.
    useEffect(() => {
        void loadStatus();
    }, []);

    useEffect(() => {
        void loadPeople();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.params]);

    /** Estado del proveedor + último run (no depende de la paginación). */
    const loadStatus = async () => {
        try {
            const [st, run] = await Promise.all([
                repoIntegrationApi.status(),
                repoIntegrationApi.lastRun().catch(() => null),
            ]);
            setStatus(st);
            setLastRun(run);
        } catch {
            showToast('No se pudo cargar el estado de la integración', 'error');
        }
    };

    /** Si GitHub redirige con ?installation_id=..., confirma la conexión y limpia la URL. */
    const handleInstallCallback = async () => {
        const params = new URLSearchParams(window.location.search);
        const installationId = params.get('installation_id');
        if (!installationId) return;
        try {
            await repoIntegrationApi.connect(Number(installationId));
            showToast('GitHub conectado', 'success');
            window.history.replaceState({}, '', window.location.pathname);
            void loadStatus();
        } catch {
            showToast('No se pudo confirmar la conexión con GitHub', 'error');
        }
    };

    /** Abre la página de la GitHub App en una pestaña nueva (instalar o gestionar). */
    const openGithubApp = async () => {
        try {
            const { url } = await repoIntegrationApi.installUrl();
            if (!url) {
                showToast('Falta GITHUB_APP_SLUG en el servidor', 'error');
                return;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            showToast('No se pudo abrir GitHub', 'error');
        }
    };

    const loadPeople = async () => {
        setLoading(true);
        try {
            const usersPage = await authAPI.getAllUsersPaginated(pagination.params);
            setMeta(usersPage.meta);
            const people = (usersPage.data ?? []).filter(
                (u: UserWithMetadata) => u.isActive !== false,
            );
            const profiles = await Promise.all(
                people.map((p) => repoIntegrationApi.getProfile(p.id).catch(() => null)),
            );
            setRows(
                people.map((p, i) => {
                    const gh = profiles[i]?.identities.find((x) => x.provider === 'github');
                    return {
                        resourceId: p.id,
                        name: p.name,
                        email: p.email,
                        username: gh?.username ?? '',
                        identityEmail: gh?.email ?? p.email,
                        confirmed: gh?.confirmed ?? false,
                    };
                }),
            );
        } catch {
            showToast('No se pudieron cargar las personas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (id: string, patch: Partial<PersonRow>) =>
        setRows((rs) => rs.map((r) => (r.resourceId === id ? { ...r, ...patch } : r)));

    /** Verifica el login contra GitHub al perder foco; pinta verde/rojo. Sin toasts ruidosos. */
    const verifyRow = async (row: PersonRow): Promise<boolean> => {
        const login = row.username.trim();
        if (!login) {
            updateRow(row.resourceId, { verified: undefined });
            return false;
        }
        if (row.verified && row.verified.login.toLowerCase() === login.toLowerCase()) {
            return true; // ya verificado, no repetir
        }
        updateRow(row.resourceId, { verifying: true });
        try {
            const found = await repoIntegrationApi.verifyUser(login);
            updateRow(row.resourceId, {
                verified: found,
                verifying: false,
                // Normaliza al login canónico (corrige mayúsculas).
                username: found ? found.login : row.username,
            });
            return !!found;
        } catch {
            updateRow(row.resourceId, { verifying: false });
            return false;
        }
    };

    const saveRow = async (row: PersonRow) => {
        // No se puede confirmar una asociación sin verificar antes el usuario en GitHub.
        if (row.confirmed && !row.verified) {
            const ok = await verifyRow(row);
            if (!ok) {
                showToast('No se guardó: el usuario de GitHub no es válido', 'error');
                return;
            }
        }
        try {
            await repoIntegrationApi.setIdentities(row.resourceId, {
                identities: [
                    {
                        provider: 'github',
                        username: row.username || undefined,
                        email: row.identityEmail || undefined,
                        confirmed: row.confirmed,
                    },
                ],
            });
            showToast(`Asociación guardada para ${row.name}`, 'success');
        } catch {
            showToast('Error al guardar la asociación', 'error');
        }
    };

    const clearRow = async (row: PersonRow) => {
        try {
            await repoIntegrationApi.clearIdentities(row.resourceId, 'github');
            updateRow(row.resourceId, { username: '', confirmed: false });
            showToast(`Asociación eliminada para ${row.name}`, 'success');
        } catch {
            showToast('Error al desasociar', 'error');
        }
    };

    /** Sugiere usernames cruzando los contributors de GitHub con el email de cada persona. */
    const suggest = async () => {
        if (!status?.configured) return;
        try {
            // Las cuentas vienen de los contributors expuestos por el status (repos);
            // pedimos match por email contra las personas.
            const accounts = rows
                .filter((r) => !r.username && r.email)
                .map((r) => ({ provider: 'github' as const, username: r.email, email: r.email }));
            if (accounts.length === 0) {
                showToast('No hay personas sin asociar con email', 'info');
                return;
            }
            const matches = await repoIntegrationApi.suggestMatches(accounts);
            let applied = 0;
            for (const m of matches) {
                if (m.suggestedResourceId && m.account.email) {
                    // sugerencia: prerellenar username con el local-part del email
                    const guess = m.account.email.split('@')[0];
                    updateRow(m.suggestedResourceId, { username: guess, confirmed: false });
                    applied += 1;
                }
            }
            showToast(`${applied} sugerencia(s) aplicadas (revisa y confirma)`, 'success');
        } catch {
            showToast('Error al sugerir matches', 'error');
        }
    };

    const runSync = async () => {
        setSyncing(true);
        try {
            const run = await repoIntegrationApi.sync();
            setLastRun(run);
            const ok = run.items.filter((i) => i.status === 'ok').length;
            showToast(`Sincronización completa: ${ok}/${run.items.length} OK (semana ${run.week})`, 'success');
        } catch {
            showToast('Error al sincronizar', 'error');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageHeader
                    title="Integraciones"
                    description="Conecta los repositorios para obtener métricas de desarrollo automáticamente"
                />

                {/* Estado del proveedor */}
                <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            {(() => {
                                const connected = !!status && status.repos.length > 0;
                                const clickable = !!status && status.mode !== 'pat';
                                const label = connected
                                    ? 'GitHub conectado'
                                    : clickable ? 'Conectar con GitHub' : 'GitHub';
                                const onClick = () => {
                                    if (!clickable) return;
                                    if (connected) {
                                        setGhMenuOpen((v) => !v); // ya conectado → menú de gestión
                                    } else {
                                        void openGithubApp(); // no conectado → instalar
                                    }
                                };
                                return (
                                    <div className="relative group">
                                        <button
                                            onClick={onClick}
                                            disabled={!clickable}
                                            data-testid={tid('integrations', 'connect')}
                                            aria-label={label}
                                            aria-haspopup={connected ? 'menu' : undefined}
                                            aria-expanded={connected ? ghMenuOpen : undefined}
                                            className={`relative flex items-center justify-center w-11 h-11 rounded-full transition-colors ${connected
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                                } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <GithubIcon className="w-6 h-6" />
                                            <span
                                                className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${connected ? 'bg-green-400' : 'bg-gray-400'
                                                    }`}
                                                title={connected ? 'Conectado' : 'Sin conectar'}
                                            />
                                        </button>
                                        {/* Tooltip solo cuando el menú está cerrado */}
                                        {clickable && !ghMenuOpen && (
                                            <span
                                                role="tooltip"
                                                className="pointer-events-none absolute top-full left-0 mt-2 whitespace-nowrap rounded-lg bg-gray-900 text-gray-100 text-xs px-2.5 py-1.5 shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
                                            >
                                                {label}
                                            </span>
                                        )}
                                        {/* Menú de gestión (solo conectado): abrir en GitHub + nota de desconexión */}
                                        {connected && ghMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setGhMenuOpen(false)} />
                                                <div className="absolute top-full left-0 mt-2 w-72 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 p-2 text-sm">
                                                    <button
                                                        onClick={() => { setGhMenuOpen(false); void openGithubApp(); }}
                                                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white flex items-center gap-2"
                                                    >
                                                        <GithubIcon className="w-4 h-4" /> Administrar en GitHub ↗
                                                    </button>
                                                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-1">
                                                        La conexión de la organización se gestiona en GitHub. Para
                                                        <span className="font-medium"> desconectar</span>, desinstala la
                                                        App desde GitHub (Settings → Applications → Installed GitHub Apps).
                                                        La vinculación de tu cuenta personal se maneja en tu Perfil.
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}
                            <div>
                                <div className="font-semibold leading-tight">GitHub</div>
                                {status?.configured ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {status.mode === 'app'
                                            ? `App · ${status.repos.length} repos`
                                            : `Token · ${status.repos.length} repos`}
                                    </div>
                                ) : (
                                    <div className="text-xs text-yellow-600 dark:text-yellow-400">Sin conectar</div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={suggest}
                                disabled={!status?.configured || loading}
                                data-testid={tid('integrations', 'suggest')}
                                title="Sugerir asociaciones por email"
                                aria-label="Sugerir asociaciones por email"
                                className="flex flex-col items-center gap-0.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                </svg>
                                <span className="text-[10px] leading-none">Sugerir</span>
                            </button>
                            <button
                                onClick={runSync}
                                disabled={syncing || !status?.configured}
                                data-testid={tid('integrations', 'sync')}
                                title="Sincronizar métricas ahora"
                                aria-label="Sincronizar métricas ahora"
                                className="flex flex-col items-center gap-0.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                <span className="text-[10px] leading-none">{syncing ? 'Sincro…' : 'Sincronizar'}</span>
                            </button>
                        </div>
                    </div>
                    {lastRun && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            Último run ({lastRun.trigger}) · semana {lastRun.week} ·{' '}
                            {new Date(lastRun.finishedAt).toLocaleString()} ·{' '}
                            {lastRun.items.filter((i) => i.status === 'ok').length}/{lastRun.items.length} OK
                        </p>
                    )}
                </div>

                {/* Búsqueda */}
                <div className="mb-4">
                    <SearchInput
                        value={pagination.search}
                        onChange={pagination.setSearch}
                        placeholder="Buscar persona por nombre o email..."
                        className="max-w-md"
                    />
                </div>

                {/* Tabla de asociación */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full" data-testid={tid('integrations', 'list')}>
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                {['Persona', 'Usuario GitHub', 'Email de commits', 'Confirmado', 'Acciones'].map((h) => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {rows.map((row) => (
                                <tr key={row.resourceId} data-testid={tid('integrations', 'row', row.resourceId)}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{row.name}</div>
                                        <div className="text-sm text-gray-500">{row.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            value={row.username}
                                            onChange={(e) => updateRow(row.resourceId, { username: e.target.value, verified: undefined })}
                                            onBlur={() => verifyRow(row)}
                                            placeholder="login"
                                            className={`w-44 px-3 py-1.5 bg-white dark:bg-gray-800 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${row.verified
                                                ? 'border-green-500 dark:border-green-500'
                                                : row.verified === null
                                                    ? 'border-red-500 dark:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        />
                                        {row.verifying && (
                                            <span className="mt-1 block text-xs text-gray-400">verificando…</span>
                                        )}
                                        {!row.verifying && row.verified && (
                                            <a
                                                href={row.verified.htmlUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 hover:underline"
                                            >
                                                <img src={row.verified.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                                                ✓ {row.verified.login}{row.verified.name ? ` · ${row.verified.name}` : ''}
                                            </a>
                                        )}
                                        {!row.verifying && row.verified === null && (
                                            <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
                                                ✗ no existe en GitHub
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            value={row.identityEmail}
                                            onChange={(e) => updateRow(row.resourceId, { identityEmail: e.target.value })}
                                            className="w-56 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={row.confirmed}
                                            onChange={(e) => updateRow(row.resourceId, { confirmed: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => saveRow(row)}
                                                title="Guardar asociación"
                                                aria-label="Guardar asociación"
                                                className="p-2 rounded text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => clearRow(row)}
                                                title="Desasociar cuenta"
                                                aria-label="Desasociar cuenta"
                                                className="p-2 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && rows.length === 0 && (
                        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                            {pagination.search ? 'No se encontraron personas' : 'No hay personas para asociar'}
                        </div>
                    )}
                    {loading && <div className="text-center py-12 text-gray-500">Cargando…</div>}

                    {!loading && rows.length > 0 && (
                        <PaginationControls
                            meta={meta}
                            page={pagination.page}
                            pageSize={pagination.pageSize}
                            onPageSizeChange={pagination.setPageSize}
                            onPrevPage={pagination.prevPage}
                            onNextPage={pagination.nextPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
