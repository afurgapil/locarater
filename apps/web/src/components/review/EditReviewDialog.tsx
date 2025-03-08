"use client";

import { Dialog } from "@headlessui/react";
import { Formik, Form } from "formik";
import { Review } from "@/types/review";
import { reviewService } from "@/services/review.service";
import { useToast } from "@/hooks/useToast";
import { RatingInput } from "./RatingInput";

interface EditReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
}

interface ReviewFormValues {
  rating: {
    overall: number;
    taste: number;
    service: number;
    ambiance: number;
    pricePerformance: number;
  };
  comment: string;
  visitDate: string;
}

export function EditReviewDialog({
  isOpen,
  onClose,
  review,
}: EditReviewDialogProps) {
  const { showToast } = useToast();

  const calculateOverallRating = (
    ratings: ReviewFormValues["rating"]
  ): number => {
    const { taste, service, ambiance, pricePerformance } = ratings;
    const sum = taste + service + ambiance + pricePerformance;
    return Number((sum / 4).toFixed(1));
  };

  const initialValues: ReviewFormValues = {
    rating: {
      overall: review.rating.overall,
      taste: review.rating.taste || 5,
      service: review.rating.service || 5,
      ambiance: review.rating.ambiance || 5,
      pricePerformance: review.rating.pricePerformance || 5,
    },
    comment: review.comment,
    visitDate: review.visitDate
      ? new Date(review.visitDate).toISOString().split("T")[0]
      : "",
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Değerlendirmeyi Düzenle
          </Dialog.Title>

          <Formik
            initialValues={initialValues}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const overallRating = calculateOverallRating(values.rating);
                const updatedValues = {
                  ...values,
                  rating: {
                    ...values.rating,
                    overall: overallRating,
                  },
                };

                await reviewService.updateReview(
                  review.locationId,
                  review._id,
                  {
                    rating: updatedValues.rating,
                    comment: updatedValues.comment,
                    visitDate: updatedValues.visitDate
                      ? new Date(updatedValues.visitDate)
                      : undefined,
                  }
                );
                showToast("Değerlendirme başarıyla güncellendi", "success");
                window.location.reload();
                onClose();
              } catch (err) {
                console.error("Error updating review:", err);
                showToast(
                  "Değerlendirme güncellenirken bir hata oluştu",
                  "error"
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lezzet
                  </label>
                  <RatingInput
                    name="rating.taste"
                    value={values.rating.taste}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Servis
                  </label>
                  <RatingInput
                    name="rating.service"
                    value={values.rating.service}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ambiyans
                  </label>
                  <RatingInput
                    name="rating.ambiance"
                    value={values.rating.ambiance}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fiyat/Performans
                  </label>
                  <RatingInput
                    name="rating.pricePerformance"
                    value={values.rating.pricePerformance}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Yorum
                  </label>
                  <textarea
                    name="comment"
                    value={values.comment}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ziyaret Tarihi
                  </label>
                  <input
                    type="date"
                    name="visitDate"
                    value={values.visitDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
