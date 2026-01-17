/**
 * Header - Barra de navegación principal de la aplicación
 */
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const Header: React.FC = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navLinkClass = (path: string) => {
        const baseClass = 'px-4 py-2 rounded-lg transition-colors font-medium';
        return isActive(path)
            ? `${baseClass} bg-blue-600 text-white`
            : `${baseClass} text-gray-300 hover:bg-gray-700 hover:text-white`;
    };

    return (
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo y título */}
                    <div className="flex items-center gap-3">
                        <svg
                            className="w-8 h-8 text-blue-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline
                                points="22 12 18 12 15 21 9 3 6 12 2 12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="flex flex-col leading-none">
                            <h1 className="text-white font-bold text-xl">PulseOps</h1>
                            <p className="text-gray-400 text-[9px]">By Unlimitech</p>
                        </div>
                    </div>

                    {/* Navegación principal */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <Link to="/" className={navLinkClass('/')}>
                            Dashboard
                        </Link>
                        <Link to="/resources" className={navLinkClass('/resources')}>
                            Recursos
                        </Link>
                        <Link to="/metrics" className={navLinkClass('/metrics')}>
                            Métricas
                        </Link>
                        <Link to="/records" className={navLinkClass('/records')}>
                            Registros
                        </Link>
                    </nav>

                    {/* Desktop: Avatar */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                            JZ
                        </div>
                    </div>

                    {/* Mobile: Menú hamburguesa */}
                    <div className="md:hidden flex items-center gap-3">
                        {/* Avatar mobile */}
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm text-white">
                            JZ
                        </div>
                        
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-700">
                        <nav className="flex flex-col space-y-2">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-2 text-left ${
                                    isActive('/')
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } rounded-lg transition-colors flex items-center gap-3`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                                Dashboard
                            </Link>
                            <Link
                                to="/resources"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-2 text-left ${
                                    isActive('/resources')
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } rounded-lg transition-colors flex items-center gap-3`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                Recursos
                            </Link>
                            <Link
                                to="/metrics"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-2 text-left ${
                                    isActive('/metrics')
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } rounded-lg transition-colors flex items-center gap-3`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                    />
                                </svg>
                                Métricas
                            </Link>
                            <Link
                                to="/records"
                                onClick={() => setIsMenuOpen(false)}
                                className={`px-4 py-2 text-left ${
                                    isActive('/records')
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } rounded-lg transition-colors flex items-center gap-3`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Registros
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};
