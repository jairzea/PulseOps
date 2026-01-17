/**
 * PulseLoader - Loading animado tipo electrocardiograma
 * Componente de carga oficial de PulseOps
 */
import React from 'react';

interface PulseLoaderProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'white';
    text?: string;
    fullScreen?: boolean;
    showText?: boolean;
}

const sizeConfig = {
    sm: { width: 50, height: 20, strokeWidth: 1.8, fontSize: 'text-xs' },
    md: { width: 100, height: 50, strokeWidth: 2.5, fontSize: 'text-sm' },
    lg: { width: 140, height: 70, strokeWidth: 3, fontSize: 'text-base' },
    xl: { width: 180, height: 90, strokeWidth: 3.5, fontSize: 'text-lg' },
};

const colorConfig = {
    primary: {
        stroke: '#3B82F6',
        glow: '#3B82F6',
        text: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    success: {
        stroke: '#10B981',
        glow: '#10B981',
        text: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    warning: {
        stroke: '#F59E0B',
        glow: '#F59E0B',
        text: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
    danger: {
        stroke: '#EF4444',
        glow: '#EF4444',
        text: 'text-red-500',
        bg: 'bg-red-500/10',
    },
    white: {
        stroke: '#FFFFFF',
        glow: '#FFFFFF',
        text: 'text-white',
        bg: 'bg-white/10',
    },
};

export const PulseLoader: React.FC<PulseLoaderProps> = ({
    size = 'md',
    variant = 'primary',
    text,
    fullScreen = false,
    showText = true,
}) => {
    const { width, height, strokeWidth, fontSize } = sizeConfig[size];
    const { stroke, glow, text: textColor, bg } = colorConfig[variant];

    // Path del electrocardiograma (forma de ECG)
    const ecgPath = `
    M 0,${height / 2}
    L ${width * 0.2},${height / 2}
    L ${width * 0.25},${height * 0.8}
    L ${width * 0.3},${height * 0.1}
    L ${width * 0.35},${height * 0.9}
    L ${width * 0.4},${height / 2}
    L ${width * 0.55},${height / 2}
    L ${width * 0.6},${height * 0.3}
    L ${width * 0.65},${height * 0.7}
    L ${width * 0.7},${height / 2}
    L ${width},${height / 2}
  `;

    const loaderContent = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* SVG Container con efecto de resplandor */}
            <div className={`relative ${bg} rounded-lg p-4`}>
                {/* Glow effect background */}
                <div
                    className="absolute inset-0 blur-xl opacity-50 animate-pulse"
                    style={{ backgroundColor: glow }}
                />

                {/* SVG Principal */}
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="relative z-10"
                    style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
                >
                    <defs>
                        {/* Gradiente para efecto de brillo */}
                        <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0.3 }} />
                            <stop offset="50%" style={{ stopColor: stroke, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0.3 }} />
                        </linearGradient>

                        {/* Máscara para efecto de animación */}
                        <mask id={`mask-${variant}`}>
                            <rect
                                x="0"
                                y="0"
                                width={width}
                                height={height}
                                fill="url(#gradient-mask)"
                            />
                        </mask>

                        <linearGradient id="gradient-mask" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0 }}>
                                <animate
                                    attributeName="offset"
                                    values="0;1"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 1 }}>
                                <animate
                                    attributeName="offset"
                                    values="0.5;1.5"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                            <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }}>
                                <animate
                                    attributeName="offset"
                                    values="1;2"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </stop>
                        </linearGradient>
                    </defs>

                    {/* Línea base (semi-transparente) */}
                    <path
                        d={ecgPath}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.3"
                    />

                    {/* Línea animada */}
                    <path
                        d={ecgPath}
                        fill="none"
                        stroke={`url(#gradient-${variant})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        mask={`url(#mask-${variant})`}
                    >
                        {/* Animación de opacidad pulsante */}
                        <animate
                            attributeName="opacity"
                            values="1;0.7;1"
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Punto brillante que sigue la línea */}
                    <circle r={strokeWidth * 1.5} fill={stroke}>
                        <animateMotion dur="2s" repeatCount="indefinite" path={ecgPath} />
                        <animate
                            attributeName="opacity"
                            values="1;0.5;1"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </div>

            {/* Texto de carga */}
            {showText && (
                <div className="flex flex-col items-center gap-2">
                    <p className={`${fontSize} font-semibold ${textColor} animate-pulse`}>
                        {text || 'Cargando'}
                    </p>
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${bg}`}
                                style={{
                                    backgroundColor: stroke,
                                    animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-50">
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

/**
 * Componente PulseLoaderOverlay - Overlay de pantalla completa
 */
export const PulseLoaderOverlay: React.FC<Omit<PulseLoaderProps, 'fullScreen'>> = (props) => {
    return <PulseLoader {...props} fullScreen />;
};

/**
 * Componente PulseLoaderInline - Versión inline para usar en contenido
 */
export const PulseLoaderInline: React.FC<Omit<PulseLoaderProps, 'fullScreen' | 'showText'>> = (
    props,
) => {
    return <PulseLoader {...props} fullScreen={false} showText={false} />;
};
