"use client";

import { useEffect, useState } from "react";
import { reviewService } from "@/services/review.service";
import { Review } from "@/types/review";
import { DashboardReviewCard } from "@/components/dashboard/DashboardReviewCard";
import { useAuthStore } from "@/store/useAuthStore";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await reviewService.getUserReviews();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Değerlendirmeler yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Bu sayfayı görüntülemek için giriş yapmalısınız.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Değerlendirmelerim
      </h1>

      {error && (
        <div className="text-center py-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Henüz değerlendirme yapmamışsınız.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <DashboardReviewCard
              key={review._id}
              review={review}
              onDelete={async () => {
                try {
                  await reviewService.deleteReview(
                    review.locationId,
                    review._id
                  );
                  setReviews(reviews.filter((r) => r._id !== review._id));
                } catch (error) {
                  console.error("Error deleting review:", error);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
