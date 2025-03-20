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
import { useUser } from "@/hooks/useUser";
import BadgesSection from "@/components/profile/BadgesSection";
import FavoritesSection from "@/components/profile/FavoritesSection";
import UserInfoSection from "@/components/profile/UserInfoSection";
import StatsSection from "@/components/profile/StatsSection";

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

          <div className="space-y-6 mt-8">
            <UserInfoSection />
            {user._id && <BadgesSection userId={user._id} />}
            {user._id && <FavoritesSection userId={user._id} />}
            {publicProfileStats && <StatsSection stats={publicProfileStats} />}
          </div>
        </div>
      </div>
    </div>
  );
}
