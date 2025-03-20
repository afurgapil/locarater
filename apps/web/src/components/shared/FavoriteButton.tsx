import { useState, useEffect } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuthStore } from "@/store/useAuthStore";
import {
  addToFavorites,
  removeFromFavorites,
  checkIsFavorite,
} from "@/services/favorite.service";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

interface FavoriteButtonProps {
  placeId: string;
  className?: string;
}

export function FavoriteButton({
  placeId,
  className = "",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    if (user && token) {
      checkInitialState();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, placeId]);

  const checkInitialState = async () => {
    try {
      const result = await checkIsFavorite(placeId);
      setIsFavorite(result);
    } catch (error) {
      console.error("Favori durumu kontrol edilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!user || !token) {
      showToast("Favorilere eklemek için giriş yapmalısınız", "error");
      return;
    }

    try {
      setIsLoading(true);
      if (isFavorite) {
        await removeFromFavorites(placeId);
        showToast("Mekan favorilerden çıkarıldı", "success");
      } else {
        await addToFavorites(placeId);
        showToast("Mekan favorilere eklendi", "success");
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Favori işlemi sırasında hata:", error);
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !token) {
    return (
      <Link
        href={`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`}
        className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
        title="Favorilere eklemek için giriş yapın"
      >
        <HeartOutline className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      </Link>
    );
  }

  return (
    <button
      onClick={handleFavoriteClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      {isFavorite ? (
        <HeartSolid className="h-6 w-6 text-red-500" />
      ) : (
        <HeartOutline className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}
