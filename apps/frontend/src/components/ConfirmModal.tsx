/**
 * ConfirmModal - Modal de confirmación reutilizable y extensible
 * Con animaciones suaves y soporte para Lottie
 */
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import deleteAnimation from '../assets/animations/delete-animation.json';
import warningAnimation from '../assets/animations/warning-animation.json';

export type ConfirmModalVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmModalVariant;
    isLoading?: boolean;
    customAnimation?: object;
}

const variantStyles = {
    danger: {
        icon: 'bg-red-500/10',
        iconText: 'text-red-500',
        button: 'bg-red-600 hover:bg-red-500 focus:ring-red-500',
        animation: warningAnimation, // Advertencia antes de acción destructiva
    },
    warning: {
        icon: 'bg-yellow-500/10',
        iconText: 'text-yellow-500',
        button: 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-500',
        animation: warningAnimation,
    },
    info: {
        icon: 'bg-blue-500/10',
        iconText: 'text-blue-500',
        button: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500',
        animation: null,
    },
    success: {
        icon: 'bg-green-500/10',
        iconText: 'text-green-500',
        button: 'bg-green-600 hover:bg-green-500 focus:ring-green-500',
        animation: null,
    },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false,
    customAnimation,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const styles = variantStyles[variant];
    const animation = customAnimation || styles.animation;

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Pequeño delay para trigger la animación
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            // Esperar a que termine la animación antes de ocultar
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        await onConfirm();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleBackdropClick}
        >
            {/* Backdrop con blur */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Modal */}
            <div
                className={`relative bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ease-out ${
                    isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
                }`}
            >
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-transparent to-gray-800/50 pointer-events-none" />

                <div className="relative p-6">
                    {/* Icon/Animation container */}
                    <div className="flex justify-center mb-6">
                        <div
                            className={`w-24 h-24 rounded-full ${styles.icon} flex items-center justify-center transition-all duration-500 ${
                                isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                            }`}
                        >
                            {animation || isLoading ? (
                                <div className="w-16 h-16">
                                    <Lottie animationData={isLoading ? deleteAnimation : animation} loop={true} />
                                </div>
                            ) : (
                                <svg
                                    className={`w-12 h-12 ${styles.iconText}`}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {variant === 'info' && (
                                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                    {variant === 'success' && (
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h3
                        className={`text-xl font-bold text-center text-white mb-3 transition-all duration-500 delay-75 ${
                            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                    >
                        {isLoading ? 'Eliminando...' : title}
                    </h3>

                    {/* Message */}
                    <p
                        className={`text-gray-400 text-center mb-8 transition-all duration-500 delay-100 ${
                            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                    >
                        {isLoading ? 'Por favor espera mientras se completa la operación...' : message}
                    </p>

                    {/* Actions */}
                    {!isLoading && (
                        <div
                            className={`flex gap-3 transition-all duration-500 delay-150 ${
                                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                            }`}
                        >
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 ${styles.button} text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
