/**
 * Header - Barra de navegación principal de la aplicación
 */
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
    const location = useLocation();

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
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo y título */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl">PulseOps</h1>
                            <p className="text-gray-400 text-xs">By Unlimitech</p>
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

                    {/* Menú mobile (hamburguesa) */}
                    <div className="md:hidden">
                        <button className="text-gray-300 hover:text-white p-2">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
