"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userService, User } from "@/services/user.service";
import {
  statisticsService,
  PublicProfileStats,
} from "@/services/statistics.service";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { getCategoryLabel, CategoryType } from "@/constants/categories";
import { useUser } from "@/hooks/useUser";
import BadgesSection from "@/components/profile/BadgesSection";
import { getFavorites, IFavorite } from "@/services/favorite.service";
import { LocationCard } from "@/components/location/LocationCard";

export default function UserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [publicProfileStats, setPublicProfileStats] =
    useState<PublicProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { showToast } = useToast();
  const { user: currentUser } = useUser();
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [visibleFavorites, setVisibleFavorites] = useState(3);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userData, profileStats] = await Promise.all([
          userService.getUserByUsername(username as string),
          statisticsService.getPublicProfileStats(username as string),
        ]);

        setUser(userData);
        setFollowerCount(userData.followers.length);
        setFollowingCount(userData.following.length);
        setPublicProfileStats(profileStats);
        fetchFavorites(userData._id);

        if (currentUser && currentUser._id !== userData._id) {
          checkFollowStatus(userData._id);
        }
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
  }, [username, currentUser]);

  const fetchFavorites = async (userId: string) => {
    try {
      setLoadingFavorites(true);
      const data = await getFavorites(userId);
      setFavorites(data);
    } catch (error) {
      console.error("Favoriler yüklenirken hata:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    try {
      const { following } = await userService.getFollowing(
        currentUser?._id || ""
      );
      setIsFollowing(following.some((user) => user._id === userId));
    } catch (error) {
      console.error("Takip durumu kontrol edilirken hata oluştu:", error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !user) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await userService.unfollowUser(user._id);
        showToast(`${user.name} kullanıcısını takipten çıktınız`, "success");
        setIsFollowing(false);
      } else {
        await userService.followUser(user._id);
        showToast(
          `${user.name} kullanıcısını takip etmeye başladınız`,
          "success"
        );
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Takip işlemi sırasında hata oluştu:", error);
      showToast("Takip işlemi sırasında bir hata oluştu", "error");
    } finally {
      setFollowLoading(false);
    }
  };

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
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.name || user.username || "Kullanıcı"}
                  </h1>
                  {user.username && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      @{user.username}
                    </p>
                  )}

                  <div className="flex gap-4 mt-2">
                    <div className="text-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {followerCount}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Takipçi
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {followingCount}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Takip
                      </p>
                    </div>
                  </div>
                </div>

                {currentUser &&
                  user &&
                  currentUser._id &&
                  user._id &&
                  currentUser._id.toString() !== user._id.toString() && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`mt-4 md:mt-0 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isFollowing
                          ? "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
                          : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                      }`}
                    >
                      {followLoading ? (
                        <Spinner size="sm" />
                      ) : isFollowing ? (
                        "Takibi Bırak"
                      ) : (
                        "Takip Et"
                      )}
                    </button>
                  )}
              </div>

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

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {user._id && <BadgesSection userId={user._id} />}
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Favori Mekanlarım
            </h2>

            {loadingFavorites ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.slice(0, visibleFavorites).map((favorite) => (
                    <LocationCard
                      key={favorite._id}
                      location={{
                        ...favorite.location,
                        reviews: [],
                        reviewCount: 0,
                        averageRating: favorite.location?.rating?.overall || 0,
                        createdBy: {
                          _id: user._id,
                          username: user.username,
                          name: user.name,
                          imageUrl: user.imageUrl,
                        },
                        createdAt: favorite.createdAt,
                        updatedAt: favorite.updatedAt,
                        ratings: {
                          average: favorite.location?.rating?.overall || 0,
                          count: 0,
                          distribution: {
                            10: 0,
                            9: 0,
                            8: 0,
                            7: 0,
                            6: 0,
                            5: 0,
                            4: 0,
                            3: 0,
                            2: 0,
                            1: 0,
                          },
                        },
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  {visibleFavorites < favorites.length && (
                    <button
                      onClick={() => setVisibleFavorites((prev) => prev + 3)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Daha Fazla Göster
                    </button>
                  )}
                  {visibleFavorites > 3 && (
                    <button
                      onClick={() => setVisibleFavorites(3)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Gizle
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Henüz favori mekan eklenmemiş.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8  border-gray-200 dark:border-gray-700 pt-6"></div>
        {publicProfileStats && (
          <>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Kullanıcı İstatistikleri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Eklenen Mekanlar
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {publicProfileStats.stats?.locationsCount || 0}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Yapılan Yorumlar
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {publicProfileStats.stats?.reviewsCount || 0}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ortalama Puan
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {typeof publicProfileStats.stats?.averageRating === "number"
                      ? publicProfileStats.stats.averageRating.toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </div>
            </div>

            {publicProfileStats.topCategories &&
              publicProfileStats.topCategories.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    En Çok Yorum Yapılan Kategoriler
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicProfileStats.topCategories.map((category, index) => (
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

            {publicProfileStats.recentActivity?.locations &&
              publicProfileStats.recentActivity.locations.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Son Eklenen Mekanlar
                  </h2>

                  <div className="space-y-4">
                    {publicProfileStats.recentActivity.locations.map(
                      (location) => (
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
                              {getCategoryLabel(
                                location.category as CategoryType
                              )}
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
                      )
                    )}
                  </div>
                </div>
              )}

            {publicProfileStats.recentActivity?.reviews &&
              publicProfileStats.recentActivity.reviews.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Son Yapılan Yorumlar
                  </h2>

                  <div className="space-y-4">
                    {publicProfileStats.recentActivity.reviews.map((review) => (
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
          </>
        )}
      </div>
    </div>
  );
}
