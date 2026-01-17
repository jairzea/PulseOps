/**
 * LoadingButton - Componente de botón con loading spinner
 */
import React from 'react';
import { PulseLoaderInline } from './PulseLoader';
import { ShredderLoaderInline } from './ShredderLoader';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    children,
    variant = 'primary',
    className = '',
    disabled,
    ...props
}) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        danger: 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 focus:ring-red-500',
    };

    // Clases cuando está loading (fondo blanco para danger)
    const loadingClasses = {
        primary: variantClasses.primary,
        secondary: variantClasses.secondary,
        danger: 'bg-white hover:bg-white focus:ring-red-500 border-2 border-transparent',
    };

    // Renderizar loader apropiado según variante
    const renderLoader = () => {
        if (variant === 'danger') {
            return <ShredderLoaderInline size="sm" variant="danger" />;
        }
        return <PulseLoaderInline size="sm" variant="white" />;
    };

    const currentVariantClasses = loading && variant === 'danger' ? loadingClasses[variant] : variantClasses[variant];

    return (
        <button
            className={`${baseClasses} ${currentVariantClasses} ${loading ? 'opacity-90' : disabled ? 'opacity-50' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? renderLoader() : children}
        </button>
    );
};
