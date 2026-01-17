/**
 * LoadingButton - Componente de botón con loading spinner
 */
import React from 'react';
import { PulseLoaderInline } from './PulseLoader';

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
    const baseClasses = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    // Mapeo de variantes de botón a variantes de PulseLoader
    const loaderVariantMap = {
        primary: 'white' as const,
        secondary: 'white' as const,
        danger: 'white' as const,
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <PulseLoaderInline size="sm" variant={loaderVariantMap[variant]} />}
            {children}
        </button>
    );
};
