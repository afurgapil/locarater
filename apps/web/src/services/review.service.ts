import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Review } from "@/types/review";

interface ApiError {
  message: string;
  response?: {
    data?: unknown;
    status?: number;
  };
}

interface ReviewResponse {
  reviews: Review[];
  ratings: {
    average: number;
    count: number;
    distribution: Record<number, number>;
  };
}

interface ReviewRating {
  overall: number;
  taste?: number;
  service?: number;
  ambiance?: number;
  pricePerformance?: number;
}

interface CreateReviewDto {
  rating: ReviewRating;
  comment: string;
  visitDate?: Date;
}

interface UpdateReviewDto {
  rating: {
    overall: number;
    taste: number;
    service: number;
    ambiance: number;
    pricePerformance: number;
  };
  comment: string;
  visitDate?: Date;
}

export const reviewService = {
  async getReviews(locationId: string): Promise<ReviewResponse> {
    const { data } = await api.get(API_ENDPOINTS.reviews.getById(locationId));
    return data;
  },

  async addReview(
    reviewData: CreateReviewDto,
    locationId: string
  ): Promise<ReviewResponse> {
    const { data } = await api.post(
      API_ENDPOINTS.reviews.create(locationId),
      reviewData
    );
    return data;
  },

  async updateReview(
    locationId: string,
    reviewId: string,
    updateData: UpdateReviewDto
  ): Promise<Review> {
    const { data } = await api.put(
      API_ENDPOINTS.reviews.update(locationId, reviewId),
      updateData
    );
    return data;
  },

  async deleteReview(locationId: string, reviewId: string): Promise<void> {
    await api.delete(API_ENDPOINTS.reviews.delete(locationId, reviewId));
  },
  async getUserReviews(): Promise<Review[]> {
    try {
      const { data } = await api.post(API_ENDPOINTS.reviews.getByUser);
      return data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error("getUserReviews error:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
      });
      throw error;
    }
  },
};
