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

interface AllReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ReviewFilters {
  page?: number;
  limit?: number;
  minRating?: number;
  startDate?: string;
  endDate?: string;
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
  image?: File;
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
  image?: File;
}

export const reviewService = {
  async getReviews(locationId: string): Promise<ReviewResponse> {
    const { data } = await api.get(API_ENDPOINTS.reviews.getById(locationId));
    return data;
  },

  async getAllReviews(filters?: ReviewFilters): Promise<AllReviewsResponse> {
    const { data } = await api.get(API_ENDPOINTS.reviews.getAll, {
      params: filters,
    });
    return data;
  },

  async addReview(
    reviewData: CreateReviewDto,
    locationId: string
  ): Promise<ReviewResponse> {
    const formData = new FormData();
    formData.append("rating[overall]", reviewData.rating.overall.toString());
    formData.append("rating[taste]", reviewData.rating.taste?.toString() || "");
    formData.append(
      "rating[service]",
      reviewData.rating.service?.toString() || ""
    );
    formData.append(
      "rating[ambiance]",
      reviewData.rating.ambiance?.toString() || ""
    );
    formData.append(
      "rating[pricePerformance]",
      reviewData.rating.pricePerformance?.toString() || ""
    );
    formData.append("comment", reviewData.comment);
    if (reviewData.visitDate) {
      const visitDate =
        reviewData.visitDate instanceof Date
          ? reviewData.visitDate
          : new Date(reviewData.visitDate);
      formData.append("visitDate", visitDate.toISOString());
    }
    if (reviewData.image) {
      formData.append("image", reviewData.image);
    }

    const { data } = await api.post(
      API_ENDPOINTS.reviews.create(locationId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

  async updateReview(
    locationId: string,
    reviewId: string,
    updateData: UpdateReviewDto
  ): Promise<Review> {
    const formData = new FormData();
    formData.append("rating[overall]", updateData.rating.overall.toString());
    formData.append("rating[taste]", updateData.rating.taste.toString());
    formData.append("rating[service]", updateData.rating.service.toString());
    formData.append("rating[ambiance]", updateData.rating.ambiance.toString());
    formData.append(
      "rating[pricePerformance]",
      updateData.rating.pricePerformance.toString()
    );
    formData.append("comment", updateData.comment);
    if (updateData.visitDate) {
      const visitDate =
        updateData.visitDate instanceof Date
          ? updateData.visitDate
          : new Date(updateData.visitDate);
      formData.append("visitDate", visitDate.toISOString());
    }
    if (updateData.image) {
      formData.append("image", updateData.image);
    }

    const { data } = await api.put(
      API_ENDPOINTS.reviews.update(locationId, reviewId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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
