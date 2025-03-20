import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUser } from "@/hooks/useUser";
import { ChevronDown, Heart } from "lucide-react";
import { getFavorites, IFavorite } from "@/services/favorite.service";
import { LocationCard } from "@/components/location/LocationCard";

interface FavoritesSectionProps {
  userId: string;
}

export default function FavoritesSection({ userId }: FavoritesSectionProps) {
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useUser();

  const fetchFavorites = async (userId: string) => {
    try {
      setLoadingFavorites(true);
      const data = await getFavorites(userId);
      setFavorites(data);
    } catch (error) {
      console.error("Favoriler yüklenirken hata:", error);
      setError("Favoriler yüklenirken bir hata oluştu");
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFavorites(userId);
    }
  }, [userId]);

  if (loadingFavorites) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Favori Mekanlar
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Favori Mekanlar
          </h2>
        </div>
        <div className="text-center p-8 text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="w-full hover:cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-3">
              <Heart className="h-6 w-6 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Favori Mekanlar
              </h2>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-6">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <LocationCard
                  key={favorite._id}
                  location={{
                    ...favorite.location,
                    reviews: [],
                    reviewCount: 0,
                    averageRating: favorite.location?.rating?.overall || 0,
                    createdBy: {
                      _id: currentUser?._id || "",
                      username: currentUser?.username || "",
                      name: currentUser?.name || "",
                      imageUrl: currentUser?.imageUrl || "",
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
          ) : (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              <p>Henüz favori mekan bulunmuyor</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
