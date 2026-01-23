import React from 'react';
import Lottie from 'lottie-react';
import type { PaginationMeta } from '../types/pagination';
import arrowAnimation from '../assets/arrow-animation.json';

interface PaginationControlsProps {
    meta: PaginationMeta;
    page: number;
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    pageSizeOptions?: number[];
}

/**
 * Componente reutilizable para controles de paginación
 * Incluye: navegación anterior/siguiente, selector de pageSize, info de página
 * 
 * @example
 * ```tsx
 * <PaginationControls
 *   meta={meta}
 *   page={pagination.page}
 *   pageSize={pagination.pageSize}
 *   onPageChange={pagination.setPage}
 *   onPageSizeChange={pagination.setPageSize}
 *   onPrevPage={pagination.prevPage}
 *   onNextPage={pagination.nextPage}
 * />
 * ```
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
    meta,
    page,
    pageSize,
    onPageSizeChange,
    onPrevPage,
    onNextPage,
    pageSizeOptions = [10, 20, 50, 100],
}) => {
    const { totalPages, totalItems } = meta;
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-500 ease-in-out">
            {/* Info de items */}
            <div className="flex items-center gap-4 transition-all duration-300">
                <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    Mostrando <span className="font-medium">{startItem}</span> a{' '}
                    <span className="font-medium">{endItem}</span> de{' '}
                    <span className="font-medium">{totalItems}</span> resultados
                </span>

                {/* Selector de pageSize */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="pageSize"
                        className="text-sm text-gray-700 dark:text-gray-300"
                    >
                        Por página:
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:border-blue-400"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevPage}
                    disabled={page === 1}
                    className="px-2 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md group"
                    title="Anterior"
                >
                    <div className="w-6 h-6 transform rotate-90">
                        <Lottie
                            animationData={arrowAnimation}
                            loop={true}
                            autoplay={true}
                            style={{
                                filter: 'grayscale(100%)',
                            }}
                        />
                    </div>
                </button>

                <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
                    Página <span className="font-medium">{page}</span> de{' '}
                    <span className="font-medium">{totalPages || 1}</span>
                </span>

                <button
                    onClick={onNextPage}
                    disabled={page >= totalPages}
                    className="px-2 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md group"
                    title="Siguiente"
                >
                    <div className="w-6 h-6 transform -rotate-90">
                        <Lottie
                            animationData={arrowAnimation}
                            loop={true}
                            autoplay={true}
                            style={{
                                filter: 'grayscale(100%)',
                            }}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
};
