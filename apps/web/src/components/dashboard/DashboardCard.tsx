import { type ComponentType } from "react";

interface DashboardCardProps {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  trend?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  trend,
}: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="ml-3 sm:ml-4">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
