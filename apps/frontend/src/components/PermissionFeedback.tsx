import React from 'react';

type Props = {
    title?: string;
    message?: string | null;
    buttonLabel?: string;
    onRetry?: () => void;
};

export const PermissionFeedback: React.FC<Props> = ({
    title = 'Acceso denegado',
    message = 'Error desconocido',
    buttonLabel = 'Reintentar',
    onRetry,
}) => {
    return (
        <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
                <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <p className="text-red-500 font-medium mb-2">{title}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
};

export default PermissionFeedback;
