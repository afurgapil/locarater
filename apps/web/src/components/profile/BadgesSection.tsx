import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge, UserBadge } from "@/types/badge";
import { badgeService } from "@/services/badge.service";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCategory } from "@/types/badge";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { ChevronDown, Award } from "lucide-react";
import { BADGES, getBadgeLabel } from "@/constants/badges";

interface BadgesSectionProps {
  userId: string;
}

export default function BadgesSection({ userId }: BadgesSectionProps) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);

        const allBadgesData = await badgeService.getAllBadges();
        setAllBadges(allBadgesData);

        if (currentUser && currentUser._id === userId) {
          const updatedBadges = await badgeService.checkAndUpdateBadges(userId);
          setUserBadges(updatedBadges);
        } else {
          const userBadgesData = await badgeService.getUserBadges();
          setUserBadges(userBadgesData);
        }
      } catch (error) {
        console.error("Rozetler yüklenirken hata:", error);
        setError("Rozetler yüklenirken bir hata oluştu");
        showToast("Rozetler yüklenirken bir hata oluştu", "error");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBadges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentUser]);

  const categories = BADGES.map((badge) => ({
    id: badge.value,
    name: getBadgeLabel(badge.value),
  }));

  const getBadgesByCategory = (category: BadgeCategory) => {
    return allBadges.filter((badge) => badge.category === category);
  };

  const getUserBadgeProgress = (badge: Badge) => {
    const userBadge = userBadges.find((ub) => {
      return ub.badgeId === badge._id;
    });

    if (!userBadge) {
      return { current: 0, required: badge.requiredCount };
    }

    return {
      current: userBadge.progress,
      required: badge.requiredCount,
    };
  };

  const isUnlocked = (badge: Badge) => {
    const userBadge = userBadges.find((ub) => ub.badgeId === badge._id);
    return userBadge?.unlockedAt !== null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center p-8 text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!allBadges.length) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Rozet Yolculuğu
          </h2>
        </div>
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          <p>Henüz rozet bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
      <Collapsible defaultOpen={true} className="w-full">
        <CollapsibleTrigger className="w-full hover:cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center gap-3">
              <Award className="h-6 w-6 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Rozet Yolculuğu
              </h2>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6">
          <Tabs defaultValue="LOCATION">
            <TabsList className="flex flex-col sm:flex-row gap-2 mb-8">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "flex-1 p-4 rounded-lg text-center bg-amber-800 text-white",
                    "border-2 border-transparent",
                    "data-[state=active]:border-amber-600 data-[state=active]:bg-amber-600 data-[state=active]:font-bold",
                    "hover:bg-amber-700 dark:hover:bg-amber-700 transition-all duration-300"
                  )}
                >
                  <div className="space-y-2">
                    <div className="text-lg font-medium">{category.name}</div>
                    <div className="text-sm text-amber-200 dark:text-amber-200">
                      {getBadgesByCategory(category.id as BadgeCategory).length}{" "}
                      Rozet
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="space-y-8">
                  {getBadgesByCategory(category.id as BadgeCategory).map(
                    (badge, index) => {
                      const progress = getUserBadgeProgress(badge);
                      const unlocked = isUnlocked(badge);
                      const progressPercentage = Math.min(
                        (progress.current / progress.required) * 100,
                        100
                      );
                      const isLast =
                        index ===
                        getBadgesByCategory(category.id as BadgeCategory)
                          .length -
                          1;

                      return (
                        <div
                          key={badge._id}
                          className={cn(
                            "relative pl-8 pb-8",
                            "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px",
                            unlocked
                              ? "before:bg-amber-500"
                              : "before:bg-gray-200 dark:before:bg-gray-700",
                            isLast ? "pb-0" : "before:h-full"
                          )}
                        >
                          <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-amber-500" />
                          <div className="ml-8">
                            <div
                              className={cn(
                                "relative p-4 flex items-center gap-4 rounded-t-lg transition-all duration-300",
                                unlocked
                                  ? "bg-amber-50 dark:bg-amber-900/20"
                                  : "bg-transparent",
                                "border-2 border-b-0 rounded-b-none",
                                unlocked
                                  ? "border-amber-200 dark:border-amber-900/50"
                                  : "border-gray-200 dark:border-gray-700/50"
                              )}
                            >
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image
                                  src={badge.image}
                                  alt={badge.name}
                                  width={48}
                                  height={48}
                                  className={cn(
                                    "rounded-full transition-all duration-300",
                                    !unlocked && "grayscale opacity-50",
                                    unlocked && "scale-110"
                                  )}
                                  priority={unlocked}
                                  unoptimized
                                />
                                {unlocked && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                                )}
                              </div>
                              <div className="flex-grow text-left">
                                <h3
                                  className={cn(
                                    "text-lg font-medium",
                                    unlocked
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  )}
                                >
                                  {badge.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {badge.description}
                                </p>
                              </div>
                              {currentUser && currentUser._id === userId && (
                                <div className="text-sm text-right">
                                  {progress.current >= progress.required ? (
                                    <span className="text-green-500 font-medium">
                                      Tamamlandı
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">
                                      {progress.current} / {progress.required}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {currentUser && currentUser._id === userId && (
                              <div
                                className={cn(
                                  "p-4 bg-white dark:bg-gray-800 rounded-b-lg border-2 border-t-0 rounded-t-none",
                                  unlocked
                                    ? "border-amber-200 dark:border-amber-900/50"
                                    : "border-gray-200 dark:border-gray-700/50"
                                )}
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-500" />
                                    <span className="text-sm font-medium">
                                      Rozet İlerlemesi
                                    </span>
                                  </div>
                                  <Progress
                                    value={progressPercentage}
                                    className={cn(
                                      "h-2",
                                      progress.current >= progress.required
                                        ? "bg-green-500"
                                        : "bg-amber-500"
                                    )}
                                  />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {unlocked
                                      ? "Rozet kazanıldı! Tebrikler!"
                                      : `Bu rozet için ${
                                          progress.required - progress.current
                                        } ${
                                          category.id === "LOCATION"
                                            ? "yer"
                                            : category.id === "REVIEW"
                                              ? "değerlendirme"
                                              : category.id === "INTERACTION"
                                                ? "etkileşim"
                                                : "kaliteli değerlendirme"
                                        } daha gerekiyor.`}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
