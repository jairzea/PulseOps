/**
 * ShredderLoader - Loading animado de bote de basura para eliminación
 * Estilo outline matching del icono de eliminar
 */
import React from 'react';

interface ShredderLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'danger' | 'white';
  text?: string;
  showText?: boolean;
}

// Tamaños fijos para mantener consistencia con iconos
const sizeConfig = {
  sm: { className: 'w-5 h-5', fontSize: 'text-xs' },
  md: { className: 'w-6 h-6', fontSize: 'text-sm' },
  lg: { className: 'w-8 h-8', fontSize: 'text-base' },
};

const colorConfig = {
  danger: {
    text: 'text-red-500',
  },
  white: {
    text: 'text-white',
  },
};

export const ShredderLoader: React.FC<ShredderLoaderProps> = ({
  size = 'md',
  variant = 'danger',
  text = 'Eliminando...',
  showText = true,
}) => {
  const { className, fontSize } = sizeConfig[size];
  const colors = colorConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Icono de basura animado - mismo estilo que el icono original */}
      <svg
        className={className}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {/* Línea superior del bote (base) */}
        <path d="M4 7h16" opacity="1" />

        {/* Cuerpo del bote de basura */}
        <path d="M5 7l.867 12.142A2 2 0 007.862 21h8.276a2 2 0 001.995-1.858L19 7" opacity="1" />

        {/* Líneas verticales internas - animadas */}
        <path d="M10 11v6" opacity="1">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M14 11v6" opacity="1">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            begin="0.3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Grupo de tapa - animado completo */}
        <g>
          <path d="M15 4v3" />
          <path d="M9 4v3" />
          <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
          
          {/* Animación de toda la tapa levantándose */}
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0"
            keyTimes="0; 0.3; 1"
            dur="2s"
            repeatCount="indefinite"
          />
        </g>

        {/* Bola de papel cayendo desde arriba */}
        <circle
          cx="12"
          cy="0"
          r="1.5"
          fill="currentColor"
          opacity="0"
        >
          {/* Animación de caída */}
          <animate
            attributeName="cy"
            values="0; 13; 13"
            keyTimes="0; 0.6; 1"
            dur="2s"
            repeatCount="indefinite"
          />
          {/* Animación de visibilidad */}
          <animate
            attributeName="opacity"
            values="0; 0; 1; 1; 0"
            keyTimes="0; 0.1; 0.2; 0.6; 0.7"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Texto opcional */}
      {showText && (
        <span className={`${fontSize} ${colors.text} font-medium animate-pulse`}>{text}</span>
      )}
    </div>
  );
};

/**
 * ShredderLoaderInline - Versión inline sin texto para usar en botones
 */
export const ShredderLoaderInline: React.FC<Omit<ShredderLoaderProps, 'text' | 'showText'>> = ({
  size = 'sm',
  variant = 'white',
}) => {
  return <ShredderLoader size={size} variant={variant} showText={false} />;
};

export default ShredderLoader;
