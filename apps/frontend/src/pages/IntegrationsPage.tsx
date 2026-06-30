/**
 * Integraciones — asociación persona ↔ cuenta de GitHub + sincronización de métricas.
 * Solo admin. v1: GitHub. Las métricas sincronizadas se persisten como MetricRecord y
 * alimentan el análisis/consolidado existente.
 */
import { useEffect, useState } from 'react';
import { showToast } from '../utils/toast';
import { PageHeader } from '../components/PageHeader';
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
}

export function IntegrationsPage() {
    const [status, setStatus] = useState<IntegrationStatus | null>(null);
    const [rows, setRows] = useState<PersonRow[]>([]);
    const [lastRun, setLastRun] = useState<SyncRunResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        void load();
        void handleInstallCallback();
    }, []);

    /** Si GitHub redirige con ?installation_id=..., confirma la conexión y limpia la URL. */
    const handleInstallCallback = async () => {
        const params = new URLSearchParams(window.location.search);
        const installationId = params.get('installation_id');
        if (!installationId) return;
        try {
            await repoIntegrationApi.connect(Number(installationId));
            showToast('GitHub conectado', 'success');
            window.history.replaceState({}, '', window.location.pathname);
            void load();
        } catch {
            showToast('No se pudo confirmar la conexión con GitHub', 'error');
        }
    };

    const connectGithub = async () => {
        try {
            const { url } = await repoIntegrationApi.installUrl();
            if (!url) {
                showToast('Falta GITHUB_APP_SLUG en el servidor', 'error');
                return;
            }
            window.location.href = url;
        } catch {
            showToast('No se pudo iniciar la conexión', 'error');
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            const [st, usersPage, run] = await Promise.all([
                repoIntegrationApi.status(),
                authAPI.getAllUsersPaginated({ page: 1, pageSize: 100 }),
                repoIntegrationApi.lastRun().catch(() => null),
            ]);
            setStatus(st);
            setLastRun(run);

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
            showToast('No se pudo cargar la integración', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (id: string, patch: Partial<PersonRow>) =>
        setRows((rs) => rs.map((r) => (r.resourceId === id ? { ...r, ...patch } : r)));

    const saveRow = async (row: PersonRow) => {
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
                            <GithubIcon className="w-5 h-5" />
                            <span className="font-semibold">GitHub</span>
                            {status?.configured ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-600 text-green-700 dark:text-white">
                                    {status.mode === 'app'
                                        ? `GitHub App · ${status.connections.length} instalación(es) · ${status.repos.length} repos`
                                        : `Token · ${status.repos.length} repos`}
                                </span>
                            ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-white">
                                    Sin conectar
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {status && status.mode !== 'pat' && (
                                <button
                                    onClick={connectGithub}
                                    data-testid={tid('integrations', 'connect')}
                                    title={status.connections.length > 0 ? 'Gestionar conexión de GitHub' : 'Conectar con GitHub'}
                                    aria-label={status.connections.length > 0 ? 'Gestionar conexión de GitHub' : 'Conectar con GitHub'}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 rounded-lg transition-opacity"
                                >
                                    <GithubIcon className="w-5 h-5" />
                                    <span>{status.connections.length > 0 ? 'Gestionar' : 'Conectar'}</span>
                                </button>
                            )}
                            <button
                                onClick={suggest}
                                disabled={!status?.configured || loading}
                                data-testid={tid('integrations', 'suggest')}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Sugerir asociaciones
                            </button>
                            <button
                                onClick={runSync}
                                disabled={syncing || !status?.configured}
                                data-testid={tid('integrations', 'sync')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {syncing ? 'Sincronizando…' : 'Sincronizar ahora'}
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
                                            onChange={(e) => updateRow(row.resourceId, { username: e.target.value })}
                                            placeholder="login"
                                            className="w-40 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => saveRow(row)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => clearRow(row)}
                                                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm transition-colors"
                                            >
                                                Desasociar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && rows.length === 0 && (
                        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                            No hay personas para asociar
                        </div>
                    )}
                    {loading && <div className="text-center py-12 text-gray-500">Cargando…</div>}
                </div>
            </div>
        </div>
    );
}
