/**
 * useConfirmModal - Hook para gestionar modales de confirmación
 */
import { useState } from 'react';
import type { ConfirmModalVariant } from '../components/ConfirmModal';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmModalVariant;
    customAnimation?: object;
}

export const useConfirmModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
    });
    const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

    const confirm = (opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);
        setIsLoading(false);

        return new Promise((resolve) => {
            setResolveCallback(() => resolve);
        });
    };

    const handleClose = () => {
        if (!isLoading && resolveCallback) {
            resolveCallback(false);
            setResolveCallback(null);
            setIsOpen(false);
        }
    };

    const handleConfirm = async () => {
        if (resolveCallback) {
            resolveCallback(true);
            setResolveCallback(null);
            // No cerramos el modal aquí, se cerrará desde donde se llama después de la operación
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setIsLoading(false);
    };

    return {
        isOpen,
        isLoading,
        options,
        confirm,
        handleClose,
        handleConfirm,
        closeModal,
    };
};
