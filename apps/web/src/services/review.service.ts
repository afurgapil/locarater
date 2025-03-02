import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import type { Review } from "@/types/review";

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
  rating?: number;
  comment?: string;
  images?: File[];
}

export const reviewService = {
  async getReviews(locationId: string): Promise<ReviewResponse> {
    const { data } = await api.get(`/locations/${locationId}/reviews`);
    return data;
  },

  async addReview(
    locationId: string,
    reviewData: CreateReviewDto
  ): Promise<ReviewResponse> {
    const { data } = await api.post(
      `/locations/${locationId}/reviews`,
      reviewData
    );
    return data;
  },

  async updateReview(
    locationId: string,
    reviewId: string,
    reviewData: CreateReviewDto
  ): Promise<ReviewResponse> {
    const { data } = await api.put(
      `/locations/${locationId}/reviews/${reviewId}`,
      reviewData
    );
    return data;
  },

  async deleteReview(locationId: string, reviewId: string): Promise<void> {
    await api.delete(`/locations/${locationId}/reviews/${reviewId}`);
  },

  async likeReview(locationId: string, reviewId: string): Promise<Review> {
    const { data } = await api.post<Review>(
      API_ENDPOINTS.locations.likeReview(locationId, reviewId)
    );
    return data;
  },

  async reportReview(
    locationId: string,
    reviewId: string,
    reason: string
  ): Promise<void> {
    await api.post(`/locations/${locationId}/reviews/${reviewId}/report`, {
      reason,
    });
  },
};
