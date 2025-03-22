import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";
import { CategoryType } from "@/constants/categories";

interface Rating {
  overall: number;
  taste: number;
  service: number;
  ambiance: number;
  pricePerformance: number;
}

interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    name: string;
    imageUrl?: string;
  };
  rating: Rating;
  comment: string;
  imageUrl?: string;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
}

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
    rating?: Rating;
    imageUrl?: string;
    reviews: Review[];
    reviewCount: number;
    ratings: {
      average: number;
      count: number;
      distribution: {
        10: number;
        9: number;
        8: number;
        7: number;
        6: number;
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    };
    createdAt: string;
    updatedAt: string;
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
