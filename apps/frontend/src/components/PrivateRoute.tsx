import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PulseLoader } from './PulseLoader';

interface PrivateRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <PulseLoader size="lg" showText text="Verificando autenticación..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
