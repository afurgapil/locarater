import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

export interface DashboardStats {
  totalLocations: number;
  totalReviews: number;
  userStats: {
    locationsCount: number;
    reviewsCount: number;
  };
  recentActivities: {
    locations: Array<{
      _id: string;
      name: string;
      createdAt: string;
    }>;
    reviews: Array<{
      _id: string;
      locationName: string;
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  };
  topLocations: Array<{
    _id: string;
    name: string;
    reviewCount: number;
    averageRating: number;
  }>;
  trends: {
    locations: string;
    reviews: string;
  };
}

interface UserStats {
  recentLocations: Array<{
    _id: string;
    name: string;
    reviewCount: number;
    averageRating: number;
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
    comment: string;
    createdAt: string;
  }>;
  topCategories: Array<{
    _id: string;
    count: number;
    averageRating: number;
  }>;
}

export interface PublicProfileStats {
  user: {
    _id: string;
    username: string;
    name: string;
    imageUrl?: string;
    createdAt: string;
  };
  stats: {
    locationsCount: number;
    reviewsCount: number;
    averageRating: number;
    memberSince: string;
  };
  recentActivity: {
    locations: Array<{
      _id: string;
      name: string;
      category: string;
      averageRating: number;
      reviewCount: number;
      createdAt: string;
    }>;
    reviews: Array<{
      _id: string;
      location: {
        _id: string;
        name: string;
      };
      rating: {
        overall: number;
        taste?: number;
        service?: number;
        ambiance?: number;
        pricePerformance?: number;
      };
      comment: string;
      createdAt: string;
    }>;
  };
  topCategories: Array<{
    category: string;
    count: number;
    averageRating: number;
  }>;
}

export const statisticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get(API_ENDPOINTS.statistics.dashboard);
    return data;
  },

  async getUserStats(): Promise<UserStats> {
    const { data } = await api.get(API_ENDPOINTS.statistics.user);
    return data;
  },

  async getPublicProfileStats(username: string): Promise<PublicProfileStats> {
    const { data } = await api.get(
      API_ENDPOINTS.statistics.publicProfileStats(username)
    );
    return data;
  },
};
