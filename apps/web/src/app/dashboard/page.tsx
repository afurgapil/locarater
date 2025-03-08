"use client";

import { useEffect, useState } from "react";
import { statisticsService } from "@/services/statistics.service";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardActivityList } from "@/components/dashboard/DashboardActivityList";
import { DashboardTopLocations } from "@/components/dashboard/DashboardTopLocations";
import {
  MapPinIcon,
  StarIcon,
  ChartBarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { DashboardStats } from "@/services/statistics.service";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await statisticsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        İstatistikler yüklenirken bir hata oluştu.
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0 pb-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Toplam Mekan"
          value={stats.totalLocations}
          icon={MapPinIcon}
          trend={stats.trends?.locations}
        />
        <DashboardCard
          title="Toplam Yorum"
          value={stats.totalReviews}
          icon={StarIcon}
          trend={stats.trends?.reviews}
        />
        <DashboardCard
          title="Mekanlarım"
          value={stats.userStats.locationsCount}
          icon={ChartBarIcon}
        />
        <DashboardCard
          title="Yorumlarım"
          value={stats.userStats.reviewsCount}
          icon={UserIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 overflow-hidden">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
            Son Aktiviteler
          </h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <DashboardActivityList activities={stats.recentActivities} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 overflow-hidden">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
            En Çok Yorum Alan Mekanlar
          </h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <DashboardTopLocations locations={stats.topLocations} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse px-4 sm:px-0">
      <div className="h-7 sm:h-8 w-36 sm:w-48 bg-gray-200 dark:bg-gray-700 rounded" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-64 sm:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
