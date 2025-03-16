"use client";

import { useState, useEffect } from "react";
import { reviewService } from "@/services/review.service";
import { Review } from "@/types/review";
import { DashboardReviewCard } from "@/components/dashboard/DashboardReviewCard";
import { useToast } from "@/hooks/useToast";
import {
  ReviewSortSelect,
  sortOptions,
} from "@/components/review/ReviewSortSelect";
import {
  ReviewFilterModal,
  FilterOptions,
} from "@/components/review/ReviewFilterModal";
import { FunnelIcon } from "@heroicons/react/24/solid";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: 0,
    maxRating: 10,
    startDate: "",
    endDate: "",
    locationName: "",
  });

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await reviewService.getUserReviews();
      setReviews(response);
      setError(null);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setError("Değerlendirmeler yüklenirken bir hata oluştu");
      showToast("Değerlendirmeler yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAndSortedReviews = [...reviews]
    .filter((review) => {
      if (
        filters.locationName.trim() &&
        !review.locationName
          .toLowerCase()
          .includes(filters.locationName.toLowerCase().trim())
      ) {
        return false;
      }

      if (filters.minRating > 0 && review.rating.overall < filters.minRating) {
        return false;
      }
      if (filters.maxRating < 10 && review.rating.overall > filters.maxRating) {
        return false;
      }

      if (filters.startDate && filters.startDate.trim() !== "") {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        const visitDate = new Date(review.visitDate);
        visitDate.setHours(0, 0, 0, 0);
        if (visitDate < startDate) {
          return false;
        }
      }

      if (filters.endDate && filters.endDate.trim() !== "") {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        const visitDate = new Date(review.visitDate);
        visitDate.setHours(0, 0, 0, 0);
        if (visitDate > endDate) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const [field, order] = selectedSort.value.split("-");
      const multiplier = order === "asc" ? 1 : -1;

      switch (field) {
        case "rating":
          return (a.rating.overall - b.rating.overall) * multiplier;
        case "locationName":
          return a.locationName.localeCompare(b.locationName) * multiplier;
        case "createdAt":
        case "updatedAt":
        case "visitDate":
          return (
            (new Date(a[field]).getTime() - new Date(b[field]).getTime()) *
            multiplier
          );
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Değerlendirmelerim
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtrele
          </button>
          <div className="w-72">
            <ReviewSortSelect
              selected={selectedSort}
              onChange={setSelectedSort}
            />
          </div>
        </div>
      </div>

      <ReviewFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />

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
      ) : filteredAndSortedReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {reviews.length === 0
              ? "Henüz değerlendirme yapmamışsınız."
              : "Filtrelere uygun değerlendirme bulunamadı."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedReviews.map((review) => (
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
                  showToast("Değerlendirme başarıyla silindi", "success");
                } catch (error) {
                  console.error("Error deleting review:", error);
                  showToast(
                    "Değerlendirme silinirken bir hata oluştu",
                    "error"
                  );
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
