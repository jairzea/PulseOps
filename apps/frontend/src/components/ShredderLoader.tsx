/**
 * ShredderLoader - Loading animado tipo trituradora de papel para eliminación
 * Componente visual para operaciones de delete
 */
import React from 'react';

interface ShredderLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'danger' | 'white';
  text?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: { width: 50, height: 28, stripWidth: 2, fontSize: 'text-xs' },
  md: { width: 80, height: 48, stripWidth: 3, fontSize: 'text-sm' },
  lg: { width: 120, height: 72, stripWidth: 4, fontSize: 'text-base' },
};

const colorConfig = {
  danger: {
    paper: '#EF4444',
    strips: '#DC2626',
    shredder: '#991B1B',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  white: {
    paper: '#FFFFFF',
    strips: '#E5E7EB',
    shredder: '#D1D5DB',
    text: 'text-white',
    bg: 'bg-white/10',
  },
};

export const ShredderLoader: React.FC<ShredderLoaderProps> = ({
  size = 'md',
  variant = 'danger',
  text = 'Eliminando...',
  showText = true,
}) => {
  const { width, height, stripWidth, fontSize } = sizeConfig[size];
  const colors = colorConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        {/* Contenedor SVG */}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definir animaciones */}
          <defs>
            {/* Gradiente para el papel */}
            <linearGradient id={`paper-gradient-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.paper} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.paper} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Trituradora (barra horizontal más gruesa y visible) */}
          <rect
            x={0}
            y={height * 0.35}
            width={width}
            height={height * 0.12}
            fill={colors.shredder}
            opacity="0.95"
          />
          {/* Líneas de la trituradora */}
          <g>
            {[...Array(Math.floor(width / (stripWidth * 2)))].map((_, i) => (
              <rect
                key={`shredder-line-${i}`}
                x={i * stripWidth * 2}
                y={height * 0.35}
                width={stripWidth * 0.6}
                height={height * 0.12}
                fill={colors.paper}
                opacity="0.3"
              />
            ))}
          </g>

          {/* Papel completo bajando (MUY VISIBLE como documento) */}
          <g>
            {/* Fondo del papel */}
            <rect
              x={width * 0.15}
              y={-height * 0.8}
              width={width * 0.7}
              height={height * 0.6}
              fill={`url(#paper-gradient-${variant})`}
              rx={3}
              opacity="1"
            >
              <animate
                attributeName="y"
                values={`${-height * 0.8};${height * 0.35}`}
                dur="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;1;0"
                keyTimes="0;0.7;1"
                dur="1s"
                repeatCount="indefinite"
              />
            </rect>
            {/* Líneas del documento para que se vea más realista */}
            {[0, 1, 2].map((line) => (
              <rect
                key={`doc-line-${line}`}
                x={width * 0.2}
                y={-height * 0.8 + height * 0.15 + line * height * 0.12}
                width={width * 0.5}
                height={height * 0.04}
                fill={colors.shredder}
                opacity="0.4"
                rx={1}
              >
                <animate
                  attributeName="y"
                  values={`${-height * 0.8 + height * 0.15 + line * height * 0.12};${height * 0.35 + height * 0.15 + line * height * 0.12}`}
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.4;0"
                  keyTimes="0;0.7;1"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>

          {/* Tiras de papel cayendo desde la trituradora */}
          {[...Array(7)].map((_, i) => {
            const xPos = width * 0.12 + (i * width * 0.11);
            const delay = `${0.7 + i * 0.08}s`;
            
            return (
              <g key={`strip-${i}`}>
                {/* Tira principal */}
                <rect
                  x={xPos}
                  y={height * 0.47}
                  width={stripWidth * 1.2}
                  height={0}
                  fill={colors.strips}
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0.5"
                    keyTimes="0;0.1;0.8;1"
                    dur="1.3s"
                    begin={delay}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="height"
                    values={`0;${height * 0.53}`}
                    dur="1.3s"
                    begin={delay}
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            );
          })}
        </svg>

        {/* Efecto de resplandor de fondo */}
        <div
          className={`absolute inset-0 ${colors.bg} blur-lg opacity-40 animate-pulse`}
          style={{ zIndex: -1 }}
        />
      </div>

      {/* Texto con puntos animados */}
      {showText && (
        <div className={`${fontSize} ${colors.text} font-medium flex items-center gap-1`}>
          <span>{text}</span>
          <span className="flex gap-0.5">
            <span className="animate-pulse" style={{ animationDelay: '0s' }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
          </span>
        </div>
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
