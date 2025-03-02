"use client";

import { useEffect, useState } from "react";
import { reviewService } from "@/services/review.service";
import { ReviewCard } from "./ReviewCard";
import type { Review } from "@/types/review";

interface ReviewListProps {
  locationId: string;
}

export function ReviewList({ locationId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [locationId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getReviews(locationId);
      setReviews(response.reviews);
    } catch (error: any) {
      setError(error.message || "Değerlendirmeler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(locationId, reviewId);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
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
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          locationId={locationId}
          onDelete={() => handleDelete(review._id)}
        />
      ))}
    </div>
  );
}
