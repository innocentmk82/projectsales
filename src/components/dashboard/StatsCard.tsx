import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 lg:p-6 transition-colors duration-200">
      <div className="flex items-center">
        <div className={`p-1.5 lg:p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
        </div>
        <div className="ml-2 lg:ml-4 min-w-0 flex-1">
          <h3 className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </h3>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;