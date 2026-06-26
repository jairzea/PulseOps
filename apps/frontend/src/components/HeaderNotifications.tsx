/**
 * HeaderNotifications — campana de alertas en el header.
 * Muestra las personas en condición crítica (PELIGRO / INEXISTENCIA) según el
 * Panorama del equipo (/analysis/overview). Badge con el conteo; al elegir una,
 * navega a su Dashboard.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, OverviewResource } from '../services/api/analysisApi';
import { tid } from '../utils/testId';

const CRITICAL = ['PELIGRO', 'INEXISTENCIA'];

export function HeaderNotifications() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [critical, setCritical] = useState<OverviewResource[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await analysisApi.getOverview();
      setCritical(
        data.resources.filter((r) => r.condition && CRITICAL.includes(r.condition)),
      );
    } catch {
      setCritical([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar (para el badge) y refrescar al abrir.
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const goTo = (id: string) => {
    setOpen(false);
    navigate(`/?resource=${id}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        data-testid={tid('nav', 'notifications-toggle')}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Alertas de condición crítica"
        aria-label="Alertas de condición crítica"
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {critical.length > 0 && (
          <span
            data-testid={tid('nav', 'notifications-badge')}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full"
          >
            {critical.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Alertas de condición</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Personas en PELIGRO o INEXISTENCIA</p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Cargando...</div>
            ) : critical.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Sin alertas. Todo en orden. 🎉</div>
            ) : (
              critical.map((r) => (
                <button
                  key={r.resourceId}
                  onClick={() => goTo(r.resourceId)}
                  data-testid={tid('nav', 'notification-item', r.resourceId)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</span>
                  <span className={`text-xs font-semibold ${r.condition === 'PELIGRO' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                    {r.condition}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
