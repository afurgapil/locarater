"use client";

import { useEffect, useState, useCallback } from "react";
import { reviewService } from "@/services/review.service";
import { ReviewCard } from "./ReviewCard";
import { EditReviewDialog } from "./EditReviewDialog";
import type { Review } from "@/types/review";
import { useAuthStore } from "@/store/useAuthStore";

interface ReviewListProps {
  locationId: string;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function ReviewList({ locationId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { user } = useAuthStore();

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewService.getReviews(locationId);
      const reviewsWithLocationId = response.reviews.map((review) => ({
        ...review,
        locationId,
      }));
      setReviews(reviewsWithLocationId);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setError(
        apiError.message ||
          apiError.response?.data?.message ||
          "Değerlendirmeler yüklenirken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(locationId, reviewId);
      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchReviews();
    setIsEditDialogOpen(false);
    setSelectedReview(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-32"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center py-4">
        {error}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Henüz değerlendirme yapılmamış
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const canModifyReview =
          !!user &&
          ((user._id && user._id === review.user._id) || user.role === "ADMIN");

        return (
          <ReviewCard
            key={review._id}
            review={review}
            locationId={locationId}
            onDelete={
              canModifyReview ? () => handleDelete(review._id) : undefined
            }
            onEdit={canModifyReview ? () => handleEdit(review) : undefined}
          />
        );
      })}

      {selectedReview && (
        <EditReviewDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
