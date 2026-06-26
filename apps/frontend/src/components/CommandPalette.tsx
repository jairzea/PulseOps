/**
 * CommandPalette — buscador global estilo DocSearch (Cmd/Ctrl+K).
 *
 * Modal centrado con input, lista filtrable de personas/recursos y navegación por
 * teclado (↑ ↓ Enter, Esc). Al elegir una persona, navega a su dashboard preseleccionado.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourcesApi, Resource } from '../services/api/resourcesApi';
import { tid } from '../utils/testId';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  DEV: 'Desarrollador',
  TL: 'Líder Técnico',
  OTHER: 'Otro',
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // Cargar recursos al abrir (una vez por apertura) y enfocar el input.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    setLoading(true);
    resourcesApi
      .getAll()
      .then((data) => setResources(data.filter((r) => r.isActive)))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? resources.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (ROLE_LABELS[r.roleType] ?? r.roleType).toLowerCase().includes(q),
        )
      : resources;
    return list.slice(0, 8);
  }, [query, resources]);

  // Mantener el índice activo dentro de rango cuando cambian los resultados.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)));
  }, [results.length]);

  const select = (r: Resource) => {
    onClose();
    navigate(`/dashboard?resource=${encodeURIComponent(r.id)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      select(results[active]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[15vh] px-4"
      onClick={onClose}
      data-testid={tid('search', 'overlay')}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar persona por nombre o rol..."
            data-testid={tid('search', 'input')}
            className="flex-1 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto py-2">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">Cargando...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500" data-testid={tid('search', 'empty')}>
              {query ? 'Sin resultados' : 'No hay personas'}
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(r)}
                data-testid={tid('search', 'result', r.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  i === active ? 'bg-blue-50 dark:bg-blue-600/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                  {r.name.substring(0, 2).toUpperCase()}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{ROLE_LABELS[r.roleType] ?? r.roleType}</span>
                </span>
                {i === active && (
                  <kbd className="hidden sm:inline-block text-[10px] font-mono text-gray-400">↵</kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-[11px] text-gray-400">
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">↵</kbd> abrir</span>
          <span><kbd className="font-mono">esc</kbd> cerrar</span>
        </div>
      </div>
    </div>
  );
}
