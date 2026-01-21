/**
 * useAvatarAnimation - Hook para manejo de animaciones de avatar
 * Separa la lógica compleja de animación del componente Header
 */
import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AvatarAnimationReturn {
  /** Ref para el botón del avatar */
  avatarRef: React.RefObject<HTMLButtonElement>;
  
  /** Si el avatar está visible (fade-in) */
  showAvatar: boolean;
  
  /** Si hay una animación en curso */
  isAnimating: boolean;
  
  /** Función para animar el logout */
  animateLogout: (onComplete: () => void) => void;
}

/**
 * Hook para manejo de animaciones del avatar en Header
 * Maneja tanto la animación de entrada (desde login) como la de salida (logout)
 */
export function useAvatarAnimation(): AvatarAnimationReturn {
  const location = useLocation();
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [showAvatar, setShowAvatar] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * Detectar si venimos del login para ocultar y mostrar el avatar con fade-in
   */
  useEffect(() => {
    if (location.state?.fromLogin) {
      setShowAvatar(false);
      // Mostrar el avatar con fade-in después de que termine la animación del clon
      const timer = setTimeout(() => {
        setShowAvatar(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  /**
   * Animar el avatar hacia el centro de la pantalla (logout)
   */
  const animateLogout = (onComplete: () => void) => {
    if (avatarRef.current && !isAnimating) {
      setIsAnimating(true);

      // Obtener posición actual del avatar
      const avatarRect = avatarRef.current.getBoundingClientRect();

      // Crear clon del avatar
      const clone = avatarRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.top = `${avatarRect.top}px`;
      clone.style.left = `${avatarRect.left}px`;
      clone.style.width = `${avatarRect.width}px`;
      clone.style.height = `${avatarRect.height}px`;
      clone.style.zIndex = '9999';
      clone.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      clone.style.pointerEvents = 'none';

      document.body.appendChild(clone);

      // Ocultar avatar original
      if (avatarRef.current) {
        avatarRef.current.style.opacity = '0';
      }

      // Ejecutar callback de completado (logout + navigate)
      onComplete();

      // Animar al centro de la pantalla
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Calcular centro exacto de la pantalla
          const avatarSize = 80; // Tamaño final del avatar (mismo que en login)
          const centerX = (window.innerWidth - avatarSize) / 2;
          const centerY = (window.innerHeight - avatarSize) / 2;

          clone.style.top = `${centerY}px`;
          clone.style.left = `${centerX}px`;
          clone.style.width = '80px';
          clone.style.height = '80px';
        });
      });

      // Remover clon después de la animación
      setTimeout(() => {
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
        setIsAnimating(false);
      }, 2000);
    }
  };

  return {
    avatarRef,
    showAvatar,
    isAnimating,
    animateLogout,
  };
}
