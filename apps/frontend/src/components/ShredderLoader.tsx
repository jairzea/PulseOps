/**
 * ShredderLoader - Loading animado de bote de basura para eliminación
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
  sm: { width: 40, height: 40, fontSize: 'text-xs' },
  md: { width: 64, height: 64, fontSize: 'text-sm' },
  lg: { width: 96, height: 96, fontSize: 'text-base' },
};

const colorConfig = {
  danger: {
    bin: '#991B1B',      // Bote de basura
    lid: '#B91C1C',      // Tapa
    paper: '#FFFFFF',    // Bola de papel
    paperShadow: '#E5E7EB',
    text: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  white: {
    bin: '#9CA3AF',
    lid: '#D1D5DB',
    paper: '#FFFFFF',
    paperShadow: '#E5E7EB',
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
  const { width, height, fontSize } = sizeConfig[size];
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
          {/* Bote de basura - cuerpo */}
          <g id="bin">
            {/* Cuerpo del bote (trapecio) */}
            <path
              d={`
                M ${width * 0.25} ${height * 0.35}
                L ${width * 0.2} ${height * 0.85}
                L ${width * 0.8} ${height * 0.85}
                L ${width * 0.75} ${height * 0.35}
                Z
              `}
              fill={colors.bin}
              stroke={colors.bin}
              strokeWidth="1"
            />
            
            {/* Líneas del bote */}
            <line
              x1={width * 0.3}
              y1={height * 0.4}
              x2={width * 0.25}
              y2={height * 0.8}
              stroke={colors.paperShadow}
              strokeWidth="1.5"
              opacity="0.3"
            />
            <line
              x1={width * 0.7}
              y1={height * 0.4}
              x2={width * 0.75}
              y2={height * 0.8}
              stroke={colors.paperShadow}
              strokeWidth="1.5"
              opacity="0.3"
            />
          </g>

          {/* Tapa del bote - con animación de apertura */}
          <g id="lid">
            <rect
              x={width * 0.2}
              y={height * 0.3}
              width={width * 0.6}
              height={height * 0.08}
              rx={height * 0.02}
              fill={colors.lid}
              style={{ transformOrigin: `${width * 0.2}px ${height * 0.34}px` }}
            >
              {/* Animación de apertura de tapa */}
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0; -45 0 0; -45 0 0; 0 0 0"
                keyTimes="0; 0.3; 0.6; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
            
            {/* Manija de la tapa */}
            <ellipse
              cx={width * 0.5}
              cy={height * 0.3}
              rx={width * 0.08}
              ry={height * 0.04}
              fill={colors.bin}
              opacity="0.6"
              style={{ transformOrigin: `${width * 0.2}px ${height * 0.34}px` }}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 0 0; -45 0 0; -45 0 0; 0 0 0"
                keyTimes="0; 0.3; 0.6; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>

          {/* Bola de papel cayendo */}
          <g id="paper-ball">
            {/* Sombra de la bola */}
            <circle
              cx={width * 0.5}
              cy={height * 0.1}
              r={width * 0.12}
              fill={colors.paperShadow}
              opacity="0.3"
            >
              <animate
                attributeName="cy"
                values={`${height * 0.1}; ${height * 0.55}; ${height * 0.55}`}
                keyTimes="0; 0.5; 1"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3; 0.3; 0"
                keyTimes="0; 0.5; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            
            {/* Bola de papel principal */}
            <circle
              cx={width * 0.5}
              cy={height * 0.1}
              r={width * 0.1}
              fill={colors.paper}
              stroke={colors.paperShadow}
              strokeWidth="1"
            >
              <animate
                attributeName="cy"
                values={`${height * 0.1}; ${height * 0.55}; ${height * 0.55}`}
                keyTimes="0; 0.5; 1"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1; 1; 0"
                keyTimes="0; 0.5; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            
            {/* Arrugas de la bola de papel */}
            {[0, 1, 2].map((i) => (
              <circle
                key={`wrinkle-${i}`}
                cx={width * 0.5 + (i - 1) * width * 0.03}
                cy={height * 0.1}
                r={width * 0.015}
                fill={colors.paperShadow}
                opacity="0.5"
              >
                <animate
                  attributeName="cy"
                  values={`${height * 0.1}; ${height * 0.55}; ${height * 0.55}`}
                  keyTimes="0; 0.5; 1"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5; 0.5; 0"
                  keyTimes="0; 0.5; 1"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </svg>
      </div>

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
