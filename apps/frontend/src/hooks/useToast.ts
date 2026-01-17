/**
 * useToast Hook - Hook personalizado para mostrar notificaciones toast
 */
import { useCallback } from 'react';
import { useToastStore, ToastType } from '../stores/toastStore';

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      addToast({ message, type, duration });
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'success', duration });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'error', duration });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'info', duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: 'warning', duration });
    },
    [addToast]
  );

  return {
    toast,
    success,
    error,
    info,
    warning,
  };
};
