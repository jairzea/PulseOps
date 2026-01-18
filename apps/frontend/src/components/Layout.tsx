/**
 * Layout - Componente de layout principal con Header
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        // Solo animar si venimos del login y no hemos animado antes
        if (location.state?.fromLogin && !hasAnimated) {
            setIsAnimating(true);
            setHasAnimated(true);

            // Hacer scroll al inicio de manera agresiva solo cuando venimos del login
            const forceScrollToTop = () => {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            };

            forceScrollToTop();
            requestAnimationFrame(forceScrollToTop);

            // Múltiples intentos para asegurar que el scroll quede al inicio
            const scrollTimers = [
                setTimeout(forceScrollToTop, 0),
                setTimeout(forceScrollToTop, 50),
                setTimeout(forceScrollToTop, 100),
                setTimeout(forceScrollToTop, 150),
                setTimeout(forceScrollToTop, 200),
                setTimeout(forceScrollToTop, 300),
            ];

            // Resetear el estado de animación después de completarla
            const animationTimer = setTimeout(() => {
                setIsAnimating(false);
            }, 2000);

            return () => {
                scrollTimers.forEach(t => clearTimeout(t));
                clearTimeout(animationTimer);
            };
        } else {
            // Si no venimos del login, solo hacer scroll normal sin animación
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    }, [location, hasAnimated]);

    return (
        <div
            className="transition-all duration-2000"
            style={{
                animation: isAnimating ? 'dashboardFadeIn 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none'
            }}
        >
            <style>{`
                @keyframes dashboardFadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `}</style>
            <Header />
            {children}
        </div>
    );
};
