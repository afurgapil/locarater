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
      <div className="text-center text-gray-500 dark:text-gray-400">
        İstatistikler yüklenirken bir hata oluştu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      {/* İstatistik Kartları */}
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
        {/* Son Aktiviteler */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Son Aktiviteler
          </h2>
          <DashboardActivityList activities={stats.recentActivities} />
        </div>

        {/* En Çok Yorum Alan Mekanlar */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            En Çok Yorum Alan Mekanlar
          </h2>
          <DashboardTopLocations locations={stats.topLocations} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
