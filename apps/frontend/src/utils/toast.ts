/**
 * Utilidad para mostrar toasts de manera sencilla
 */
import { useToastStore } from '../stores/toastStore';
import type { ToastType } from '../stores/toastStore';

/**
 * Muestra un toast con el mensaje y tipo especificados
 * @param message - Mensaje a mostrar
 * @param type - Tipo de toast (success, error, info, warning)
 * @param duration - Duración en milisegundos (opcional, default: 5000)
 */
export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration?: number
): void => {
  useToastStore.getState().addToast({
    message,
    type,
    duration,
  });
};

/**
 * Muestra un toast de éxito
 */
export const showSuccessToast = (message: string, duration?: number): void => {
  showToast(message, 'success', duration);
};

/**
 * Muestra un toast de error
 */
export const showErrorToast = (message: string, duration?: number): void => {
  showToast(message, 'error', duration);
};

/**
 * Muestra un toast de información
 */
export const showInfoToast = (message: string, duration?: number): void => {
  showToast(message, 'info', duration);
};

/**
 * Muestra un toast de advertencia
 */
export const showWarningToast = (message: string, duration?: number): void => {
  showToast(message, 'warning', duration);
};

/**
 * Limpia todos los toasts activos
 */
export const clearAllToasts = (): void => {
  useToastStore.getState().clearAllToasts();
};
