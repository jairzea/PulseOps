/**
 * Toast Component - Componente individual de notificación toast
 */
import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Toast as ToastType } from '../stores/toastStore';
import successAnimation from '../assets/animations/success.json';
import errorAnimation from '../assets/animations/error.json';

interface ToastProps {
    toast: ToastType;
    onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            // Iniciar animación de salida 500ms antes de remover
            const exitTimer = setTimeout(() => {
                setIsExiting(true);
            }, toast.duration - 500);

            return () => clearTimeout(exitTimer);
        }
    }, [toast.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300); // Duración de la animación de salida
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return (
                    <div className="w-10 h-10 flex-shrink-0">
                        <Lottie
                            animationData={successAnimation}
                            loop={false}
                            style={{ width: 40, height: 40 }}
                        />
                    </div>
                );
            case 'error':
                return (
                    <div className="w-10 h-10 flex-shrink-0">
                        <Lottie
                            animationData={errorAnimation}
                            loop={false}
                            style={{ width: 40, height: 40 }}
                        />
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-yellow-500/20 dark:bg-yellow-500/20 rounded-full">
                        <svg
                            className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-500/20 dark:bg-blue-500/20 rounded-full">
                        <svg
                            className="w-6 h-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30';
            case 'error':
                return 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/30';
            case 'info':
            default:
                return 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30';
        }
    };

    const getTextColor = () => {
        switch (toast.type) {
            case 'success':
                return 'text-green-800 dark:text-green-100';
            case 'error':
                return 'text-red-800 dark:text-red-100';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-100';
            case 'info':
            default:
                return 'text-blue-800 dark:text-blue-100';
        }
    };

    return (
        <div
            className={`
        flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm
        shadow-lg shadow-black/20
        ${getBackgroundColor()}
        ${getTextColor()}
        ${isExiting
                    ? 'animate-toast-exit'
                    : 'animate-toast-enter'
                }
        transition-all duration-300
        min-w-[320px] max-w-md
      `}
            role="alert"
        >
            {getIcon()}

            <p className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
            </p>

            <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 
                   focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20 rounded p-1"
                aria-label="Cerrar notificación"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
