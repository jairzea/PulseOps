/**
 * AutocompleteInfinite - Componente de autocompletado con scroll infinito y búsqueda en backend
 */
import { useState, useRef, useEffect } from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export interface AutocompleteInfiniteOption {
    value: string;
    label: string;
    description?: string;
}

interface AutocompleteInfiniteProps {
    value: string;
    onChange: (value: string) => void;
    fetchFunction: (page: number, search: string, pageSize: number) => Promise<{
        data: AutocompleteInfiniteOption[];
        meta: { totalPages: number }
    }>;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean;
    pageSize?: number;
}

export const AutocompleteInfinite: React.FC<AutocompleteInfiniteProps> = ({
    value,
    onChange,
    fetchFunction,
    placeholder = 'Buscar...',
    disabled = false,
    className = '',
    error = false,
    pageSize = 20,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [selectedLabel, setSelectedLabel] = useState<string>(''); // Guardar label seleccionado
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const {
        items: options,
        loading,
        hasMore,
        search,
        setSearch,
        loadMore,
    } = useInfiniteScroll({
        fetchFunction,
        pageSize,
        searchDebounce: 300,
    });

    // Obtener la opción seleccionada
    const selectedOption = options.find(opt => opt.value === value);

    // Actualizar selectedLabel cuando se encuentra la opción o cambia el value
    useEffect(() => {
        if (selectedOption) {
            setSelectedLabel(selectedOption.label);
        } else if (!value) {
            setSelectedLabel('');
        }
        // Si value existe pero selectedOption no, mantener el selectedLabel anterior
    }, [selectedOption, value]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Intersection Observer para scroll infinito
    useEffect(() => {
        if (!isOpen) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [isOpen, hasMore, loading, loadMore]);

    // Resetear índice resaltado cuando cambian las opciones
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [search, options]);

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(true);
            setSearch('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setIsOpen(true);
    };

    const handleOptionClick = (optionValue: string) => {
        const option = options.find(opt => opt.value === optionValue);
        if (option) {
            setSelectedLabel(option.label); // Guardar label antes de cerrar
        }
        onChange(optionValue);
        setIsOpen(false);
        setSearch(''); // Limpiar búsqueda después de seleccionar
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setIsOpen(true);
            return;
        }

        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < options.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                    handleOptionClick(options[highlightedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearch('');
                inputRef.current?.blur();
                break;
        }
    };

    const displayValue = isOpen ? search : selectedLabel;

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-900 dark:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Dropdown de opciones */}
            {isOpen && !disabled && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                    {options.length === 0 && !loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No se encontraron resultados
                        </div>
                    ) : (
                        <>
                            {options.map((option, index) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleOptionClick(option.value)}
                                    className={`px-4 py-2 cursor-pointer transition-colors ${index === highlightedIndex
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        } ${option.value === value
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-white'
                                        }`}
                                >
                                    <div className="font-medium">{option.label}</div>
                                    {option.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {option.description}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading indicator y trigger para scroll infinito */}
                            <div ref={observerTarget} className="px-4 py-2 text-center">
                                {loading && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Cargando...
                                    </div>
                                )}
                                {!loading && !hasMore && options.length > 0 && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                        No hay más resultados
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
