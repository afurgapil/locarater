import { PublicProfileStats } from "@/services/statistics.service";
import { formatDate } from "@/lib/utils";
import { getCategoryLabel, CategoryType } from "@/constants/categories";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, BarChart } from "lucide-react";

interface StatsSectionProps {
  stats: PublicProfileStats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="w-full hover:cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart className="h-6 w-6 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Kullanıcı İstatistikleri
              </h2>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Eklenen Mekanlar
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.stats?.locationsCount || 0}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Yapılan Yorumlar
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.stats?.reviewsCount || 0}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ortalama Puan
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {typeof stats.stats?.averageRating === "number"
                  ? stats.stats.averageRating.toFixed(1)
                  : "0.0"}
              </p>
            </div>
          </div>

          {stats.topCategories && stats.topCategories.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                En Çok Yorum Yapılan Kategoriler
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.topCategories.map((category, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getCategoryLabel(category.category as CategoryType)}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        {category.count} yorum
                      </span>
                      <span className="text-yellow-500">
                        {typeof category.averageRating === "number"
                          ? category.averageRating.toFixed(1)
                          : "0.0"}{" "}
                        ★
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.recentActivity?.locations &&
            stats.recentActivity.locations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Son Eklenen Mekanlar
                </h3>

                <div className="space-y-4">
                  {stats.recentActivity.locations.map((location) => (
                    <div
                      key={location._id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <Link href={`/locations/${location._id}`}>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {location.name}
                        </h3>
                      </Link>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getCategoryLabel(location.category as CategoryType)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(location.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {location.reviewCount || 0} yorum
                        </span>
                        <span className="text-yellow-500">
                          {typeof location.averageRating === "number"
                            ? location.averageRating.toFixed(1)
                            : "0.0"}{" "}
                          ★
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {stats.recentActivity?.reviews &&
            stats.recentActivity.reviews.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Son Yapılan Yorumlar
                </h3>

                <div className="space-y-4">
                  {stats.recentActivity.reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <Link href={`/locations/${review.location._id}`}>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                          {review.location.name}
                        </h3>
                      </Link>
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500 mr-2">
                          {typeof review.rating.overall === "number"
                            ? review.rating.overall.toFixed(1)
                            : "0.0"}{" "}
                          ★
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
