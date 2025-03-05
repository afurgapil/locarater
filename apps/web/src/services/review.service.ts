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

  async updateReview(id: string, updateData: UpdateReviewDto): Promise<Review> {
    const { data } = await api.put(
      API_ENDPOINTS.reviews.update(id),
      updateData
    );
    return data;
  },

  async deleteReview(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.reviews.delete(id));
  },
  async getUserReviews(): Promise<Review[]> {
    try {
      const { data } = await api.post(API_ENDPOINTS.reviews.getByUser);
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("getUserReviews error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};
