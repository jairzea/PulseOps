import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import logoUnlimitech from '../assets/img/logoUnlimitech.png';
import profileAnimation from '../assets/Profile.json';
import lockAnimation from '../assets/lock-unlocked.json';
import backgroundLogin from '../assets/img/background-login.png';
import eyeAnimation from '../assets/eye-opening.json';
import { PulseLoader } from '../components/PulseLoader';

export function LoginPage2() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const lottieRef = useRef<any>(null);

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

        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 overflow-hidden">
            {/* Imagen de fondo morada detrás del modal */}
            <div className="absolute inset-0">
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
                        <div className="w-full max-w-md">
                            {/* Avatar con siglas dinámicas */}
                            <div className="flex justify-center mb-8">
                                <div
                                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white/50 transition-all duration-500 ${username.length >= 2
                                        ? 'bg-gradient-to-br from-purple-500 to-blue-500 scale-110'
                                        : 'bg-gray-300 scale-100'
                                        }`}
                                >
                                    {username.length >= 2 ? (
                                        <span className="text-white font-bold text-3xl animate-fade-in">
                                            {username.substring(0, 2).toUpperCase()}
                                        </span>
                                    ) : (
                                        <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Título */}
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to login system</h1>
                                <p className="text-gray-600 text-sm">Sign in byentering the infomation below</p>
                            </div>

                            {/* Formulario */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Campo de usuario */}
                                <div>
                                    <div className="flex items-center rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-3 has-[input:focus]:border-blue-400 has-[input:focus]:bg-white/70 transition-all">
                                        <div className="shrink-0 mr-3 text-gray-400">
                                            <Lottie
                                                animationData={profileAnimation}
                                                loop={true}
                                                style={{ width: 20, height: 20 }}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                                            placeholder="Designer"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo de contraseña */}
                                <div>
                                    <div className="flex items-center rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-3 has-[input:focus]:border-blue-400 has-[input:focus]:bg-white/70 transition-all">
                                        <div className="shrink-0 mr-3 text-gray-400">
                                            <Lottie
                                                animationData={lockAnimation}
                                                loop={true}
                                                style={{ width: 20, height: 20 }}
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
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-white/50 border-white/60 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-500">Remember me</span>
                                    </label>
                                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>

                                {/* Botones */}
                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className={`flex-1 py-3 px-6 rounded-full font-semibold text-white transition-all duration-300 ${isLoggingIn
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {isLoggingIn ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
