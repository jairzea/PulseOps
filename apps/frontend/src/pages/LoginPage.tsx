import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import logoUnlimitech from '../assets/img/logoUnlimitech.png';
import profileAnimation from '../assets/Profile.json';
import lockAnimation from '../assets/lock-unlocked.json';
import backgroundLogin from '../assets/img/background-login.png';
import eyeAnimation from '../assets/eye-opening.json';
import { PulseLoader } from '../components/PulseLoader';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const lottieRef = useRef<any>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Detectar si venimos del logout
    useEffect(() => {
        if (location.state?.fromLogout) {
            // Esperar un poco antes de mostrar el login con fade-in
            setTimeout(() => {
                setShowLogin(true);
            }, 100);
        } else {
            setShowLogin(true);
        }
    }, [location]);

    // Redirigir si ya está autenticado (solo si no está animando)
    useEffect(() => {
        if (isAuthenticated && !isAnimating) {
            navigate('/');
        }
    }, [isAuthenticated, navigate, isAnimating]);

    // Controlar la animación del ojo
    useEffect(() => {
        if (lottieRef.current) {
            if (showPassword) {
                // Reproducir de cerrado a abierto
                lottieRef.current.setDirection(1);
                lottieRef.current.play();
            } else {
                // Reproducir de abierto a cerrado (reversa)
                lottieRef.current.setDirection(-1);
                lottieRef.current.play();
            }
        }
    }, [showPassword]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);

        try {
            await login({ email, password });

            // Activar animación de transición del avatar
            if (avatarRef.current) {
                setIsAnimating(true);

                // Obtener posición actual del avatar
                const avatarRect = avatarRef.current.getBoundingClientRect();

                // Crear clon del avatar para la animación
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

                // Navegar inmediatamente al dashboard con estado de animación
                navigate('/', { state: { fromLogin: true } });

                // Forzar scroll al inicio de manera agresiva
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }, 0);
                setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }, 100);
                setTimeout(() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }, 200);

                // Esperar un frame para que el navegador aplique los estilos iniciales
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        // Posición de destino (esquina superior derecha del header)
                        // Avatar en el header está aproximadamente en top: 16px, right: 24px
                        const targetTop = 16;
                        const targetRight = 24;
                        const targetSize = 40; // Tamaño del avatar en el header (w-10 h-10)

                        clone.style.top = `${targetTop}px`;
                        clone.style.left = `${window.innerWidth - targetRight - targetSize}px`;
                        clone.style.width = `${targetSize}px`;
                        clone.style.height = `${targetSize}px`;
                    });
                });

                // Remover el clon después de la animación
                setTimeout(() => {
                    document.body.removeChild(clone);
                }, 2000);
            } else {
                // Si no hay ref del avatar, navegar normalmente
                navigate('/');
            }
        } catch (error) {
            // El error ya se muestra en el toast desde AuthContext
            console.error('Login error:', error);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            <style>{`
                @keyframes loginFadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
            {/* Imagen de fondo morada detrás del modal */}
            <div
                className="absolute inset-0"
                style={{
                    animation: showLogin ? 'loginFadeIn 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : 'none',
                    opacity: showLogin ? 1 : 0
                }}
            >
                <img
                    src={backgroundLogin}
                    alt="Background"
                    className="w-full h-full object-cover scale-[1.2]"
                    style={{ objectPosition: '50% center' }}
                />
                {/* Overlay opaco */}
                <div className="absolute inset-0 bg-white/80"></div>
            </div>

            {/* Modal con efecto vidrio - Pantalla completa simulada */}
            <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
                <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    {/* Imagen de fondo del modal */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                        <img
                            src={backgroundLogin}
                            alt="Background"
                            className="w-full h-full object-cover scale-[1.35]"
                            style={{ objectPosition: '80% center' }}
                        />
                    </div>

                    {/* Header del modal */}
                    <div className="relative z-20 flex items-center justify-between p-8">
                        {/* Logo de la aplicación - Izquierda */}
                        <div className="flex items-center gap-3">
                            {/* Logo ECG usando PulseLoader */}
                            <PulseLoader size="sm" variant="transparent" showText={false} />
                            <span className="text-gray-800 font-bold text-xl">PulseOps</span>
                        </div>

                        {/* Powered by Unlimitech - Derecha */}
                        <div className="flex items-center gap-2">
                            <span className="text-white text-sm drop-shadow-md">Powered by</span>
                            <img src={logoUnlimitech} alt="Unlimitech" className="w-8 h-8 brightness-0 invert drop-shadow-md" />
                            <span className="text-white font-semibold text-sm drop-shadow-md">Unlimitech</span>
                        </div>
                    </div>

                    {/* Formulario alineado a la izquierda y centrado verticalmente */}
                    <div className="absolute inset-0 w-1/2 flex items-center justify-center p-12 z-10">
                        <div className="w-full max-w-md scale-90">
                            {/* Avatar con siglas dinámicas */}
                            <div className="flex justify-center mb-6">
                                <div
                                    ref={avatarRef}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white/50 transition-all duration-500 ${email.length >= 2
                                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 scale-110'
                                        : 'bg-gray-300 scale-100'
                                        }`}
                                >
                                    {email.length >= 2 ? (
                                        <span className="text-white font-bold text-2xl animate-fade-in">
                                            {email.substring(0, 2).toUpperCase()}
                                        </span>
                                    ) : (
                                        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Título */}
                            <div className="mb-6 text-center">
                                <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome to PulseOps</h1>
                                <p className="text-gray-600 text-sm">Sign in by entering your credentials</p>
                            </div>

                            {/* Formulario */}
                            <form onSubmit={handleLogin} className="space-y-3">
                                {/* Campo de usuario */}
                                <div>
                                    <div className="flex items-center rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-2.5 shadow has-[input:focus]:border-blue-400 has-[input:focus]:bg-white/70 has-[input:focus]:shadow-lg transition-all">
                                        <div className="shrink-0 mr-3 text-gray-400">
                                            <Lottie
                                                animationData={profileAnimation}
                                                loop={true}
                                                style={{ width: 18, height: 18 }}
                                            />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                                            placeholder="email@example.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Campo de contraseña */}
                                <div>
                                    <div className="flex items-center rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-2.5 shadow has-[input:focus]:border-blue-400 has-[input:focus]:bg-white/70 has-[input:focus]:shadow-lg transition-all">
                                        <div className="shrink-0 mr-3 text-gray-400">
                                            <Lottie
                                                animationData={lockAnimation}
                                                loop={true}
                                                style={{ width: 18, height: 18 }}
                                            />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-all duration-300"
                                        >
                                            <Lottie
                                                lottieRef={lottieRef}
                                                animationData={eyeAnimation}
                                                loop={false}
                                                autoplay={false}
                                                style={{ width: 24, height: 24 }}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me y Forgot password */}
                                <div className="flex items-center justify-between text-xs pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-3.5 h-3.5 text-blue-600 bg-white/50 border-white/60 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-500">Remember me</span>
                                    </label>
                                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>

                                {/* Botones */}
                                <div className="flex items-center gap-4 pt-1">
                                    <button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className={`flex-1 py-2.5 px-6 rounded-full font-semibold text-sm text-white transition-all duration-300 ${isLoggingIn
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {isLoggingIn ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Logging in...
                                            </span>
                                        ) : (
                                            'Login'
                                        )}
                                    </button>
                                </div>

                                {/* Divisor */}
                                <div className="relative py-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-3 bg-white/50 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                {/* Botón de Google */}
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Funcionalidad pendiente
                                            console.log('Google login - Coming soon');
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-white/70 backdrop-blur-sm border border-gray-300 rounded-full hover:bg-white/90 hover:shadow-md transition-all duration-300"
                                        title="Continue with Google"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
