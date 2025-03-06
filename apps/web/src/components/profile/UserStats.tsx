"use client";

import { useEffect, useState } from "react";
import { statisticsService } from "@/services/statistics.service";

interface UserStatsData {
  recentLocations: Array<{
    _id: string;
    name: string;
    createdAt: string;
  }>;
  recentReviews: Array<{
    _id: string;
    location: {
      _id: string;
      name: string;
    };
    rating: {
      overall: number;
    };
    createdAt: string;
  }>;
  topCategories: Array<{
    _id: string;
    count: number;
    averageRating: number;
  }>;
}

export function UserStats() {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsService.getUserStats();
        console.log(data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-5/6"></div>
      </div>
    );
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
      {/* Son Eklenen Mekanlar */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Son Eklenen Mekanlar
        </h3>
        <ul className="space-y-2">
          {stats.recentLocations.map((location) => (
            <li
              key={location._id}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              {location.name} -{" "}
              {new Date(location.createdAt).toLocaleDateString("tr-TR")}
            </li>
          ))}
          {stats.recentLocations.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400 italic">
              Henüz mekan eklenmemiş
            </li>
          )}
        </ul>
      </div>

      {/* Son Yapılan Yorumlar */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Son Yapılan Yorumlar
        </h3>
        <ul className="space-y-2">
          {stats.recentReviews.map((review) => (
            <li
              key={review._id}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              {review.location.name} - ⭐ {review.rating.overall.toFixed(1)} -{" "}
              {new Date(review.createdAt).toLocaleDateString("tr-TR")}
            </li>
          ))}
          {stats.recentReviews.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400 italic">
              Henüz yorum yapılmamış
            </li>
          )}
        </ul>
      </div>

      {/* En Çok Yorum Yapılan Kategoriler */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          En Çok Yorum Yapılan Kategoriler
        </h3>
        <ul className="space-y-2">
          {stats.topCategories.map((category) => (
            <li
              key={category._id}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              {category._id} - {category.count} yorum - ⭐{" "}
              {category.averageRating.toFixed(1)}
            </li>
          ))}
          {stats.topCategories.length === 0 && (
            <li className="text-sm text-gray-500 dark:text-gray-400 italic">
              Henüz kategori istatistiği yok
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
