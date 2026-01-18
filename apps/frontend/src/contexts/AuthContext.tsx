import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { authAPI } from '../services/authService';
import { showToast } from '../utils/toast';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar si hay un token guardado al montar
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const result = await authAPI.validateToken();
            if (result.valid && result.user) {
                setUser(result.user);
            } else {
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth validation failed:', error);
            localStorage.removeItem('auth_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authAPI.login(credentials);
            localStorage.setItem('auth_token', response.access_token);
            setUser(response.user);
            showToast('¡Bienvenido!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Error al iniciar sesión', 'error');
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authAPI.register(data);
            localStorage.setItem('auth_token', response.access_token);
            setUser(response.user);
            showToast('Cuenta creada exitosamente', 'success');
        } catch (error: any) {
            showToast(error.message || 'Error al registrar usuario', 'error');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        showToast('Sesión cerrada', 'info');
    };

    const refreshUser = async () => {
        try {
            const profile = await authAPI.getProfile();
            setUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
            });
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
