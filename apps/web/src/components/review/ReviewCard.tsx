"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { StarIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { reviewService } from "@/services/review.service";
import { useToast } from "@/hooks/useToast";
import type { Review } from "@/types/review";

interface ReviewCardProps {
  review: Review;
  locationId: string;
  onDelete?: () => void;
}

export function ReviewCard({ review, locationId, onDelete }: ReviewCardProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await reviewService.deleteReview(locationId, review._id);
      onDelete();
      showToast("Değerlendirme başarıyla silindi", "success");
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast("Değerlendirme silinirken bir hata oluştu", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span className="font-medium text-gray-900 dark:text-white">
              {review.user.name}
            </span>
            <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-gray-700 dark:text-gray-300">
                {review.rating.overall.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(review.createdAt), "d MMMM yyyy", { locale: tr })}
          </div>
        </div>
        <div className="flex space-x-2">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              title="Değerlendirmeyi sil"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
          {/* //TODO: Report button
          <button
            onClick={() => setIsReporting(true)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            title="Değerlendirmeyi raporla"
          >
            <FlagIcon className="h-5 w-5" />
          </button>
          */}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
      </div>

      {review.rating.taste && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div>Lezzet: {review.rating.taste}</div>
          <div>Servis: {review.rating.service}</div>
          <div>Ambiyans: {review.rating.ambiance}</div>
          <div>Fiyat/Performans: {review.rating.pricePerformance}</div>
        </div>
      )}

      {isReporting && (
        <div className="mt-4 space-y-3">
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Raporlama sebebinizi yazın..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsReporting(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
