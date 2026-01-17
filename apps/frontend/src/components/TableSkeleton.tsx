/**
 * TableSkeleton - Skeleton loader reutilizable para tablas
 */
import React from 'react';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showActions?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns,
  rows = 5,
  showActions = true,
}) => {
  const actualColumns = showActions ? columns : columns - 1;

  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 flex gap-4">
        {Array.from({ length: actualColumns }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 bg-gray-700 rounded"
            style={{ width: i === actualColumns - 1 && showActions ? '100px' : '150px' }}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="px-6 py-4 flex gap-4 items-center">
            {Array.from({ length: actualColumns }).map((_, colIndex) => {
              // Última columna (acciones)
              if (colIndex === actualColumns - 1 && showActions) {
                return (
                  <div key={`cell-${rowIndex}-${colIndex}`} className="flex gap-2 ml-auto">
                    <div className="h-8 w-16 bg-gray-700 rounded" />
                    <div className="h-8 w-16 bg-gray-700 rounded" />
                  </div>
                );
              }

              // Columnas normales con diferentes anchos
              const widths = ['w-32', 'w-24', 'w-48', 'w-20', 'w-28'];
              const width = widths[colIndex % widths.length];

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`h-4 bg-gray-700 rounded ${width}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
