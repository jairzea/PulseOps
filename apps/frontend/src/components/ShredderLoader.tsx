/**
 * ShredderLoader - Loading animado de bote de basura para eliminación
 * Usa animación Lottie de alta calidad
 */
import React from 'react';
import Lottie from 'lottie-react';
import deleteAnimation from '../assets/animations/delete-animation.json';

interface ShredderLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'danger' | 'white';
  text?: string;
  showText?: boolean;
}

// Tamaños para la animación Lottie
const sizeConfig = {
  sm: { width: 20, height: 20, fontSize: 'text-xs' },
  md: { width: 32, height: 32, fontSize: 'text-sm' },
  lg: { width: 48, height: 48, fontSize: 'text-base' },
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
  const { width, height, fontSize } = sizeConfig[size];
  const colors = colorConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div style={{ width: `${width}px`, height: `${height}px` }}>
        <Lottie
          animationData={deleteAnimation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
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
