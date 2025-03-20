import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";
import { CategoryType } from "@/constants/categories";

export interface IFavorite {
  _id: string;
  user: string;
  location: {
    _id: string;
    name: string;
    description: string;
    address: {
      city: string;
      district: string;
    };
    category: CategoryType;
    rating?: {
      overall: number;
      taste: number;
      service: number;
      ambiance: number;
      pricePerformance: number;
    };
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const addToFavorites = async (
  locationId: string
): Promise<IFavorite> => {
  const response = await api.post<IFavorite>(API_ENDPOINTS.favorites.add, {
    locationId,
  });
  return response.data;
};

export const removeFromFavorites = async (
  locationId: string
): Promise<void> => {
  await api.delete(API_ENDPOINTS.favorites.remove(locationId));
};

export const getFavorites = async (userId: string): Promise<IFavorite[]> => {
  const response = await api.get<IFavorite[]>(
    API_ENDPOINTS.favorites.get(userId)
  );
  return response.data;
};

export const checkIsFavorite = async (
  userId: string,
  locationId: string
): Promise<boolean> => {
  try {
    const favorites = await getFavorites(userId);
    return favorites.some((favorite) => favorite.location._id === locationId);
  } catch (error) {
    console.error("Favori kontrolü sırasında hata:", error);
    return false;
  }
};
