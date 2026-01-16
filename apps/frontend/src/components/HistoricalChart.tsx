import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Record } from '../services/apiClient';

interface HistoricalChartProps {
  records: Record[];
  metricName: string;
  loading?: boolean;
}

interface ChartDataPoint {
  week: string;
  value: number;
  displayWeek: string;
}

export function HistoricalChart({ records, metricName, loading = false }: HistoricalChartProps) {
  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600 mb-4"
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
          <p className="text-gray-400">No data available</p>
          <p className="text-gray-500 text-sm mt-1">Select a resource and metric to view the chart</p>
        </div>
      </div>
    );
  }

  // Ordenar y transformar datos
  const sortedRecords = [...records].sort((a, b) => a.week.localeCompare(b.week));

  const chartData: ChartDataPoint[] = sortedRecords.map((record) => ({
    week: record.week,
    value: record.value,
    displayWeek: formatWeek(record.week),
  }));

  // Calcular tendencia lineal simple
  const trendData = calculateTrendLine(chartData);

  return (
    <div className="w-full h-96 bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{metricName} - Historical Trend</h3>
        <p className="text-sm text-gray-400">Time series analysis with trend line</p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="displayWeek"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickLine={{ stroke: '#4B5563' }}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickLine={{ stroke: '#4B5563' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6',
            }}
            formatter={(value: number) => [value.toFixed(2), metricName]}
            labelFormatter={(label) => `Week: ${label}`}
          />
          <Legend
            wrapperStyle={{ color: '#9CA3AF' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 5 }}
            activeDot={{ r: 7, fill: '#60A5FA' }}
            name="Actual Value"
            animationDuration={500}
          />
          <Line
            data={trendData}
            type="monotone"
            dataKey="trend"
            stroke="#A855F7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Trend Line"
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatWeek(week: string): string {
  // Formato: "2024-W01" -> "W01"
  const parts = week.split('-');
  return parts.length === 2 ? parts[1] : week;
}

function calculateTrendLine(data: ChartDataPoint[]): Array<{ displayWeek: string; trend: number }> {
  if (data.length < 2) return [];

  const n = data.length;
  const xValues = data.map((_, i) => i);
  const yValues = data.map((d) => d.value);

  // Calcular regresión lineal: y = mx + b
  const xSum = xValues.reduce((a, b) => a + b, 0);
  const ySum = yValues.reduce((a, b) => a + b, 0);
  const xxSum = xValues.reduce((a, x) => a + x * x, 0);
  const xySum = xValues.reduce((a, x, i) => a + x * yValues[i], 0);

  const m = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const b = (ySum - m * xSum) / n;

  return data.map((point, i) => ({
    displayWeek: point.displayWeek,
    trend: m * i + b,
  }));
}
