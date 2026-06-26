/**
 * InfoTooltip — ícono de ayuda (?) con popover informativo al hover/focus.
 *
 * Accesible: el disparador es un <button> con aria-label; el contenido se asocia vía
 * aria-describedby y aparece también con foco de teclado, no solo con mouse.
 * Pensado para explicar campos de configuración (ejemplos, cómo afecta a otros campos).
 */
import { useId, useState } from 'react';

interface InfoTooltipProps {
  /** Texto o contenido enriquecido del tooltip. */
  content: React.ReactNode;
  /** Posición del popover respecto al ícono. Default: 'top'. */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Etiqueta accesible del botón. Default: 'Más información'. */
  label?: string;
  className?: string;
}

const positionClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function InfoTooltip({
  content,
  position = 'top',
  label = 'Más información',
  className = '',
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v); // toggle en táctil/click
        }}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-[10px] font-bold leading-none hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-50 w-64 max-w-xs ${positionClasses[position]} rounded-lg bg-gray-900 text-gray-100 text-xs leading-relaxed p-3 shadow-xl border border-gray-700 pointer-events-none`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
