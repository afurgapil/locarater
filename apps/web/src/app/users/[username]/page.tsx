"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userService, User } from "@/services/user.service";
import { profileService, UserStats } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { getCategoryLabel, CategoryType } from "@/constants/categories";

export default function UserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserByUsername(
          username as string
        );
        setUser(userData);
        const stats = await profileService.getUserStats();
        setUserStats(stats);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Bilinmeyen hata";
        console.error("Kullanıcı profili yüklenirken hata oluştu:", err);
        setError(
          errorMessage || "Kullanıcı profili yüklenirken bir hata oluştu"
        );
        showToast("Kullanıcı profili yüklenirken bir hata oluştu", "error");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-12">
          Kullanıcı Bulunamadı
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Aradığınız kullanıcı profili bulunamadı veya erişim izniniz yok.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-12">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-300">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                ) : (
                  <span>
                    {user.name?.[0]?.toUpperCase() ||
                      user.username?.[0]?.toUpperCase() ||
                      "?"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || user.username || "Kullanıcı"}
              </h1>
              {user.username && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  @{user.username}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {user.role === "USER"
                    ? "Kullanıcı"
                    : user.role === "ADMIN"
                      ? "Yönetici"
                      : user.role === "BUSINESS_OWNER"
                        ? "İşletme Sahibi"
                        : user.role}
                </span>
                {user.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Doğrulanmış
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Kullanıcı Bilgileri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.createdAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Üyelik Tarihi
                  </p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              )}

              {user.lastLogin && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Son Giriş
                  </p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {userStats && (
            <>
              {userStats.topCategories.length > 0 && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    En Çok Değerlendirilen Kategoriler
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userStats.topCategories.map((category) => (
                      <div
                        key={category._id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getCategoryLabel(category._id as CategoryType)}
                        </h3>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <p>Değerlendirme Sayısı: {category.count}</p>
                          <p>
                            Ortalama Puan: {category.averageRating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userStats.recentLocations.length > 0 && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Son Eklenen Mekanlar
                  </h2>
                  <div className="space-y-4">
                    {userStats.recentLocations.map((location) => (
                      <div
                        key={location._id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {location.name}
                        </h3>
                        <div className="mt-2 flex justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Değerlendirme: {location.reviewCount}</span>
                          <span>{formatDate(location.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userStats.recentReviews.length > 0 && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Son Değerlendirmeler
                  </h2>
                  <div className="space-y-4">
                    {userStats.recentReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.location.name}
                        </h3>
                        <div className="mt-2">
                          <p className="text-gray-600 dark:text-gray-400">
                            {review.comment}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              Puan: {review.rating.overall.toFixed(1)}
                            </span>
                            <span>{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
