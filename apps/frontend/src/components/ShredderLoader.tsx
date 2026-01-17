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
  sm: { width: 50, height: 24, stripWidth: 2, fontSize: 'text-xs' },
  md: { width: 80, height: 40, stripWidth: 3, fontSize: 'text-sm' },
  lg: { width: 120, height: 60, stripWidth: 4, fontSize: 'text-base' },
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

          {/* Trituradora (líneas superiores más visibles) */}
          <g>
            {[...Array(Math.floor(width / (stripWidth * 2)))].map((_, i) => (
              <rect
                key={`shredder-${i}`}
                x={i * stripWidth * 2}
                y={0}
                width={stripWidth}
                height={height * 0.2}
                fill={colors.shredder}
                opacity="1"
              />
            ))}
          </g>

          {/* Papel siendo triturado (animación descendente MÁS VISIBLE) */}
          <rect
            x={width * 0.1}
            y={-height * 0.6}
            width={width * 0.8}
            height={height * 0.5}
            fill={`url(#paper-gradient-${variant})`}
            rx={2}
            opacity="1"
            stroke={colors.paper}
            strokeWidth="1"
          >
            <animate
              attributeName="y"
              values={`${-height * 0.6};${height * 0.2};${height * 0.2}`}
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;1;0.3;0"
              keyTimes="0;0.6;0.8;1"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Tiras de papel cayendo */}
          {[...Array(6)].map((_, i) => {
            const xPos = width * 0.15 + (i * width * 0.12);
            const delay = `${0.6 + i * 0.1}s`;
            const fallDuration = '1.5s';
            
            return (
              <g key={`strip-${i}`}>
                {/* Tira completa */}
                <rect
                  x={xPos}
                  y={height * 0.2}
                  width={stripWidth}
                  height={height * 0.8}
                  fill={colors.strips}
                  opacity="0"
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0.4"
                    keyTimes="0;0.2;0.7;1"
                    dur={fallDuration}
                    begin={delay}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="height"
                    values={`0;${height * 0.2};${height * 0.8};${height * 0.8}`}
                    keyTimes="0;0.2;0.7;1"
                    dur={fallDuration}
                    begin={delay}
                    repeatCount="indefinite"
                  />
                </rect>
                
                {/* Pequeños segmentos que flotan */}
                <rect
                  x={xPos + stripWidth * 0.5}
                  y={height * 0.2}
                  width={stripWidth * 0.8}
                  height={stripWidth * 2}
                  fill={colors.strips}
                  opacity="0"
                >
                  <animate
                    attributeName="y"
                    values={`${height * 0.2};${height * 0.6};${height}`}
                    dur="1.8s"
                    begin={`${1 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.9;0"
                    dur="1.8s"
                    begin={`${1 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 ${xPos} ${height * 0.2};180 ${xPos} ${height * 0.6};360 ${xPos} ${height}`}
                    dur="1.8s"
                    begin={`${1 + i * 0.1}s`}
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
