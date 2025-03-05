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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
