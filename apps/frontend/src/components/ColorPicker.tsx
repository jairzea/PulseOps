import { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
    value: string; // formato rgb(r, g, b)
    onChange: (rgb: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
    const [tempRgb, setTempRgb] = useState({ r: 0, g: 0, b: 0 });
    const [isSelecting, setIsSelecting] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'RGB' | 'HSL'>('RGB');
    const [isDragging, setIsDragging] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const wheelRef = useRef<HTMLDivElement>(null);

    // Parsear el color inicial
    useEffect(() => {
        const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const newRgb = {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
            setRgb(newRgb);
            setTempRgb(newRgb);
        }
    }, [value]);

    // Función para obtener color desde coordenadas polares en la rueda
    const getColorFromWheel = (x: number, y: number): { r: number; g: number; b: number } => {
        // Calcular ángulo en grados, ajustado para coincidir con el gradiente (0° = arriba)
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        angle = (angle + 90 + 360) % 360; // Ajustar para que 0° esté arriba

        // Convertir ángulo a color RGB (basado en HSV con S=1, V=1)
        const h = angle;
        const s = 1;
        const v = 1;

        const c = v * s;
        const x1 = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;

        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c; g = x1; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x1; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x1;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x1; b = c;
        } else if (h >= 240 && h < 300) {
            r = x1; g = 0; b = c;
        } else {
            r = c; g = 0; b = x1;
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    };

    // Manejar clic en el círculo del medio
    const handleCenterClick = () => {
        setIsSelecting(true);
    };

    // Confirmar selección
    const handleConfirm = () => {
        setRgb(tempRgb);
        const colorString = `rgb(${tempRgb.r}, ${tempRgb.g}, ${tempRgb.b})`;
        onChange(colorString);

        // Agregar a colores recientes
        setRecentColors(prev => {
            const filtered = prev.filter(c => c !== colorString);
            return [colorString, ...filtered].slice(0, 5);
        });

        setIsSelecting(false);
        setIsOpen(false);
    };

    // Cancelar selección
    const handleCancel = () => {
        setTempRgb(rgb);
        setIsSelecting(false);
    };

    // Manejar cambio directo de valores RGB
    const handleRgbInputChange = (channel: 'r' | 'g' | 'b', value: string) => {
        const numValue = parseInt(value);
        if (isNaN(numValue) || value === '') {
            // Permitir vacío temporalmente para poder borrar
            return;
        }
        const clampedValue = Math.max(0, Math.min(255, numValue));
        setTempRgb(prev => ({ ...prev, [channel]: clampedValue }));
    };

    // Manejar cambio directo de valores HSL
    const handleHslInputChange = (channel: 'h' | 's' | 'l', value: string) => {
        const numValue = parseInt(value);
        if (isNaN(numValue) || value === '') {
            return;
        }
        let clampedValue: number;
        if (channel === 'h') {
            clampedValue = Math.max(0, Math.min(360, numValue));
        } else {
            clampedValue = Math.max(0, Math.min(100, numValue));
        }

        const currentHsl = rgbToHsl(tempRgb.r, tempRgb.g, tempRgb.b);
        const newHsl = { ...currentHsl, [channel]: clampedValue };
        const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        setTempRgb(newRgb);
    };

    // Manejar inicio del arrastre
    const handleWheelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!wheelRef.current) return;

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;

        const distance = Math.sqrt(x * x + y * y);
        const outerRadius = rect.width / 2;
        const innerRadius = rect.width * 0.65 / 2; // 65% del radio

        // Solo iniciar arrastre si está en el anillo cromático
        if (distance >= innerRadius && distance <= outerRadius) {
            setIsDragging(true);
            const newColor = getColorFromWheel(x, y);
            setTempRgb(newColor);
        }
    };

    // Manejar movimiento durante el arrastre
    const handleWheelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !wheelRef.current) return;

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = e.clientX - rect.left - centerX;
        const y = e.clientY - rect.top - centerY;

        const newColor = getColorFromWheel(x, y);
        setTempRgb(newColor);
    };

    // Manejar fin del arrastre
    const handleWheelMouseUp = () => {
        setIsDragging(false);
    };

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Manejar eventos globales de mouse para arrastre
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging || !wheelRef.current) return;

            const rect = wheelRef.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const x = e.clientX - rect.left - centerX;
            const y = e.clientY - rect.top - centerY;

            const newColor = getColorFromWheel(x, y);
            setTempRgb(newColor);
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging]);

    const rgbToHex = (r: number, g: number, b: number): string => {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    };

    // Convertir RGB a HSL
    const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    // Convertir HSL a RGB
    const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    };

    const hsl = rgbToHsl(tempRgb.r, tempRgb.g, tempRgb.b);

    const handleHslChange = (channel: 'h' | 's' | 'l', value: number) => {
        const newHsl = { ...hsl, [channel]: value };
        const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        setTempRgb(newRgb);
    };

    // Calcular ángulo del color actual para posicionar el puntero
    const getColorAngle = (r: number, g: number, b: number): number => {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        if (delta === 0) return 0;

        let hue = 0;
        if (max === r) {
            hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            hue = ((b - r) / delta + 2) / 6;
        } else {
            hue = ((r - g) / delta + 4) / 6;
        }

        return hue * 360;
    };

    const colorAngle = getColorAngle(tempRgb.r, tempRgb.g, tempRgb.b);

    const handleSliderChange = (channel: 'r' | 'g' | 'b', value: number) => {
        const newRgb = { ...tempRgb, [channel]: value };
        setTempRgb(newRgb);
    };

    const currentColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const tempColor = `rgb(${tempRgb.r}, ${tempRgb.g}, ${tempRgb.b})`;

    return (
        <div className="relative">
            {/* Botón que abre el picker */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-10 rounded-lg border-2 shadow-sm hover:brightness-110 transition-all relative overflow-hidden group"
                style={{
                    backgroundColor: currentColor,
                    borderColor: currentColor,
                    boxShadow: `0 0 0 1px ${currentColor}, 0 1px 2px 0 rgba(0, 0, 0, 0.05)`
                }}
            >
                <div className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>

            {/* Modal/Popover */}
            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute z-50 mt-2 left-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Color Picker
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Rueda de color con círculo central */}
                    <div className="relative w-56 h-56 mx-auto mb-6">
                        {/* Gradiente circular de fondo - clickeable y arrastrable */}
                        <div
                            ref={wheelRef}
                            onMouseDown={handleWheelMouseDown}
                            onMouseMove={handleWheelMouseMove}
                            onMouseUp={handleWheelMouseUp}
                            className="absolute inset-0 rounded-full cursor-pointer select-none"
                            style={{
                                background: `conic-gradient(
                  from 0deg,
                  rgb(255, 0, 0) 0deg,
                  rgb(255, 255, 0) 60deg,
                  rgb(0, 255, 0) 120deg,
                  rgb(0, 255, 255) 180deg,
                  rgb(0, 0, 255) 240deg,
                  rgb(255, 0, 255) 300deg,
                  rgb(255, 0, 0) 360deg
                )`,
                                WebkitMaskImage: 'radial-gradient(circle, transparent 65%, black 65%, black 85%, transparent 85%)',
                                maskImage: 'radial-gradient(circle, transparent 65%, black 65%, black 85%, transparent 85%)'
                            }}
                        />

                        {/* Puntero que indica el color seleccionado en el círculo cromático */}
                        <div
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-1000 z-20"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) rotate(${colorAngle}deg) translateY(-107px)`,
                                backgroundColor: tempColor
                            }}
                        />

                        {/* Círculo central con el color seleccionado */}
                        <div
                            onClick={handleCenterClick}
                            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${isSelecting ? 'w-24 h-24' : 'w-20 h-20'
                                }`}
                            style={{ backgroundColor: tempColor }}
                        >
                            {/* Código HEX centrado dentro del círculo */}
                            <span
                                className="text-sm font-mono font-bold drop-shadow-lg"
                                style={{
                                    color: (tempRgb.r * 0.299 + tempRgb.g * 0.587 + tempRgb.b * 0.114) > 150 ? '#000000' : '#FFFFFF'
                                }}
                            >
                                {rgbToHex(tempRgb.r, tempRgb.g, tempRgb.b).toUpperCase()}
                            </span>
                        </div>

                        {/* Botones de confirmación/cancelación cuando está seleccionando */}
                        {isSelecting && (
                            <>
                                {/* Botón X (cancelar) - izquierda */}
                                <button
                                    onClick={handleCancel}
                                    className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
                                    style={{ left: '18%', transform: 'translate(-50%, -50%)' }}
                                >
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Botón ✓ (confirmar) - derecha */}
                                <button
                                    onClick={handleConfirm}
                                    className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-10"
                                    style={{ left: '82%', transform: 'translate(-50%, -50%)' }}
                                >
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Tabs RGB / HSL */}
                    <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('RGB')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'RGB'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            RGB
                        </button>
                        <button
                            onClick={() => setActiveTab('HSL')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'HSL'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            HSL
                        </button>
                    </div>

                    {/* Sliders RGB */}
                    {activeTab === 'RGB' && (
                        <div className="space-y-4 mb-6">
                            {/* Red */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">
                                    R
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={tempRgb.r}
                                    onChange={(e) => handleSliderChange('r', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gradient-to-r from-black to-red-500 rounded-full appearance-none cursor-pointer slider-thumb-blue"
                                    style={{
                                        background: `linear-gradient(to right, rgb(0, ${tempRgb.g}, ${tempRgb.b}), rgb(255, ${tempRgb.g}, ${tempRgb.b}))`
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={tempRgb.r}
                                    onChange={(e) => handleRgbInputChange('r', e.target.value)}
                                    className="text-sm font-mono text-gray-900 dark:text-white w-12 text-right bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Green */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">
                                    G
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={tempRgb.g}
                                    onChange={(e) => handleSliderChange('g', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gradient-to-r from-black to-green-500 rounded-full appearance-none cursor-pointer slider-thumb-blue"
                                    style={{
                                        background: `linear-gradient(to right, rgb(${tempRgb.r}, 0, ${tempRgb.b}), rgb(${tempRgb.r}, 255, ${tempRgb.b}))`
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={tempRgb.g}
                                    onChange={(e) => handleRgbInputChange('g', e.target.value)}
                                    className="text-sm font-mono text-gray-900 dark:text-white w-12 text-right bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Blue */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">
                                    B
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={tempRgb.b}
                                    onChange={(e) => handleSliderChange('b', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gradient-to-r from-black to-blue-500 rounded-full appearance-none cursor-pointer slider-thumb-blue"
                                    style={{
                                        background: `linear-gradient(to right, rgb(${tempRgb.r}, ${tempRgb.g}, 0), rgb(${tempRgb.r}, ${tempRgb.g}, 255))`
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={tempRgb.b}
                                    onChange={(e) => handleRgbInputChange('b', e.target.value)}
                                    className="text-sm font-mono text-gray-900 dark:text-white w-12 text-right bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Sliders HSL */}
                    {activeTab === 'HSL' && (
                        <div className="space-y-4 mb-6">
                            {/* Hue */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">
                                    H
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={hsl.h}
                                    onChange={(e) => handleHslChange('h', parseInt(e.target.value))}
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer slider-thumb-blue"
                                    style={{
                                        background: 'linear-gradient(to right, rgb(255,0,0) 0%, rgb(255,255,0) 17%, rgb(0,255,0) 33%, rgb(0,255,255) 50%, rgb(0,0,255) 67%, rgb(255,0,255) 83%, rgb(255,0,0) 100%)'
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="360"
                                    value={hsl.h}
                                    onChange={(e) => handleHslInputChange('h', e.target.value)}
                                    className="text-sm font-mono text-gray-900 dark:text-white w-12 text-right bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Saturation */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">
                                    S
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={hsl.s}
                                    onChange={(e) => handleHslChange('s', parseInt(e.target.value))}
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer slider-thumb-blue"
                                    style={{
                                        background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={hsl.s}
                                    onChange={(e) => handleHslInputChange('s', e.target.value)}
                                    className="text-sm font-mono text-gray-900 dark:text-white w-12 text-right bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Lightness */}
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-4">
                                    L
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={hsl.l}
                                    onChange={(e) => handleHslChange('l', parseInt(e.target.value))}
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer slider-thumb-blue"
                                    style={{
                                        background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`
                                    }}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={hsl.l}
                                    onChange={(e) => handleHslInputChange('l', e.target.value)}
                                    className="text-sm font-mono text-gray-900 dark:text-white w-12 text-right bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Colores recientes */}
                    {recentColors.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Recent Colors
                                </h4>
                                <button
                                    onClick={() => setRecentColors([])}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {recentColors.map((color, index) => {
                                    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                                    const hex = match
                                        ? rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]))
                                        : '#000000';

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => onChange(color)}
                                            className="group relative w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                                            style={{ backgroundColor: color }}
                                            title={hex}
                                        >
                                            <div className="absolute inset-0 bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Estilos para el slider thumb */}
            <style>{`
        input[type="range"].slider-thumb-blue::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3B82F6;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        input[type="range"].slider-thumb-blue::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3B82F6;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}
