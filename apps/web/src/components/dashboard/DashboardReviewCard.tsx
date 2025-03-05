import { useState } from "react";
import Link from "next/link";
import { Review } from "@/types/review";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { EditReviewDialog } from "../review/EditReviewDialog";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";

interface DashboardReviewCardProps {
  review: Review;
  onDelete: () => Promise<void>;
}

export function DashboardReviewCard({
  review,
  onDelete,
}: DashboardReviewCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                <Link
                  href={`/locations/${review.locationId}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {review.locationName}
                </Link>
              </h3>
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                    {review.rating.overall.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {review.comment}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lezzet: ⭐ {review.rating.taste.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Servis: ⭐ {review.rating.service.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ambiyans: ⭐ {review.rating.ambiance.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fiyat/Performans: ⭐ {review.rating.pricePerformance.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditReviewDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        review={review}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={onDelete}
        title="Değerlendirmeyi Sil"
        message="Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}
