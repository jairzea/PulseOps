import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps } from 'recharts';
import { Record } from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';

interface HistoricalChartProps {
  records: Record[];
  metricName: string;
  loading?: boolean;
  lineColor?: string;
}

interface ChartDataPoint {
  week: string;
  value: number;
  trend: number;
  timestamp: string;
}

export const HistoricalChart = memo(function HistoricalChart({ records, metricName, loading = false, lineColor = '#3B82F6' }: HistoricalChartProps) {
  const { theme } = useTheme();

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      const date = new Date(data.timestamp);
      const formattedDate = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      return (
        <div
          style={{
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#D1D5DB'}`,
            borderRadius: '0.375rem',
            color: theme === 'dark' ? '#F9FAFB' : '#111827',
            padding: '12px',
            position: 'relative',
          }}
        >
          {/* Fecha en la esquina superior derecha */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '10px',
              color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
            }}
          >
            {formattedDate}
          </div>

          {/* Contenido principal del tooltip */}
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280', marginBottom: '8px', fontSize: '14px' }}>
              {label}
            </p>
            {payload.map((entry, index) => (
              <p
                key={`item-${index}`}
                style={{
                  color: entry.color,
                  fontSize: '14px',
                  marginBottom: '4px',
                  fontWeight: 500,
                }}
              >
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // Solo mostrar skeleton si está loading Y no hay datos
  // Esto permite que el gráfico permanezca visible mientras carga nuevos datos
  if (loading && (!records || records.length === 0)) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="w-full h-96 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Select a resource and metric to view the chart</p>
        </div>
      </div>
    );
  }

  // Ordenar y construir datos del gráfico
  const sortedRecords = [...records].sort((a, b) => a.week.localeCompare(b.week));

  // Calcular regresión lineal
  const { slope, intercept } = calculateLinearRegression(sortedRecords);

  const chartData: ChartDataPoint[] = sortedRecords.map((record, index) => {
    const trendValue = slope * index + intercept;
    return {
      week: formatWeek(record.week),
      value: record.value,
      trend: Number(trendValue.toFixed(2)),
      timestamp: record.timestamp,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Histórico de {metricName}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
          <XAxis
            dataKey="week"
            stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
          />
          <YAxis
            stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            name="Valor Real"
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Línea de Tendencia"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

// ============================================================================
// Helper Functions
// ============================================================================

function formatWeek(week: string): string {
  // Formato: "2024-W01" -> "W01"
  const parts = week.split('-');
  return parts.length === 2 ? parts[1] : week;
}

function calculateLinearRegression(records: Array<{ value: number }>): {
  slope: number;
  intercept: number;
} {
  const n = records.length;

  if (n === 0) {
    return { slope: 0, intercept: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  records.forEach((record, index) => {
    const x = index;
    const y = record.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}
