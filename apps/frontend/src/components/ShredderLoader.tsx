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
      <div className="relative">
        {/* Icono de basura - base estática */}
        <svg
          className={className}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 7h16" />
          <path d="M5 7l.867 12.142A2 2 0 007.862 21h8.276a2 2 0 001.995-1.858L19 7" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M15 7V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" />
        </svg>
        
        {/* Bola de papel cayendo - animación separada */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div 
            className="w-1.5 h-1.5 rounded-full bg-current opacity-0"
            style={{
              animation: 'dropPaper 1.5s ease-in infinite'
            }}
          />
        </div>
      </div>

      {/* Texto opcional */}
      {showText && (
        <span className={`${fontSize} ${colors.text} font-medium animate-pulse`}>{text}</span>
      )}
      
      <style>{`
        @keyframes dropPaper {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: translateY(15px);
            opacity: 1;
          }
          60% {
            opacity: 0;
          }
          100% {
            transform: translateY(15px);
            opacity: 0;
          }
        }
      `}</style>
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
