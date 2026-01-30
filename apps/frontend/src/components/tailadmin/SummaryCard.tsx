import React from 'react';

interface Props {
  title: string;
  value: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  icon?: React.ReactNode;
}

export const SummaryCard: React.FC<Props> = ({ title, value, variant = 'blue', icon }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    gray: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className={`${colors[variant]} rounded-full p-2`}>{icon}</div>
      </div>
    </div>
  );
};

export default SummaryCard;
