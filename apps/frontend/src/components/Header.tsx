/**
 * Header - Barra de navegación principal de la aplicación
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeSwitch } from './ThemeSwitch';

export const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showAvatar, setShowAvatar] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLButtonElement>(null);

    // Detectar si venimos del login para ocultar y mostrar el avatar con fade-in
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

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
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

            // Ejecutar logout y navegar
            logout();
            setIsUserMenuOpen(false);
            navigate('/login', { state: { fromLogout: true } });

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

    return (
        <header className="bg-gray-800 dark:bg-gray-950 border-b border-gray-700 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-[1800px] mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left side: Logo */}
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-xl font-bold text-white">PulseOps</span>
                                <small className="text-[9px] text-gray-600 dark:text-gray-400/60">
                                    By Unlimitech
                                </small>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Live</span>
                        </div>
                    </div>

                    {/* Right side: Search, Notifications, Theme Toggle, Menu, Avatar */}
                    <div className="flex items-center gap-4">
                        {/* Search Icon */}
                        <button className="p-2 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Notifications Icon */}
                        <button className="p-2 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Theme Toggle Switch */}
                        <ThemeSwitch />

                        {/* Menu Icon (3 dots) with dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 transition-colors duration-300">
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                navigate('/');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 ${isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/resources');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 ${isActive('/resources') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Recursos
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/metrics');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 ${isActive('/metrics') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                            </svg>
                                            Métricas
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/records');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 ${isActive('/records') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Registros
                                        </button>
                                        <div className="border-t border-gray-700 my-2"></div>
                                        <button
                                            onClick={() => {
                                                navigate('/configuration');
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 ${isActive('/configuration') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Configuración
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={() => {
                                                    navigate('/users');
                                                    setIsMenuOpen(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left transition-colors flex items-center gap-3 ${isActive('/users') ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                Usuarios
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Avatar with dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <style>{`
                                @keyframes avatarFadeIn {
                                    0% {
                                        opacity: 0;
                                        transform: scale(0.8);
                                    }
                                    100% {
                                        opacity: 1;
                                        transform: scale(1);
                                    }
                                }
                            `}</style>
                            <button
                                ref={avatarRef}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
                                style={{
                                    opacity: showAvatar ? 1 : 0,
                                    animation: showAvatar ? 'avatarFadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none'
                                }}
                            >
                                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 transition-colors duration-300">
                                    <div className="px-4 py-3 border-b border-gray-700">
                                        <p className="text-sm text-white font-medium">{user?.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                                        {user?.role === 'admin' && (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-600 text-white rounded">Admin</span>
                                        )}
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Mi Perfil
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            disabled={isAnimating}
                                            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
