"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Review } from "@/types/review";
import { reviewService } from "@/services/review.service";
import { useToast } from "@/hooks/useToast";
import { RatingInput } from "./RatingInput";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface EditReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review;
  onSuccess?: () => void;
}

interface UpdateReviewValues {
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

const validationSchema = Yup.object().shape({
  rating: Yup.object().shape({
    overall: Yup.number().required().min(0).max(10),
    taste: Yup.number().required().min(0).max(10),
    service: Yup.number().required().min(0).max(10),
    ambiance: Yup.number().required().min(0).max(10),
    pricePerformance: Yup.number().required().min(0).max(10),
  }),
  comment: Yup.string().min(1, "Yorum en az 1 karakter olmalıdır").nullable(),
  visitDate: Yup.string().required("Ziyaret tarihi zorunludur"),
});

export function EditReviewDialog({
  isOpen,
  onClose,
  review,
  onSuccess,
}: EditReviewDialogProps) {
  const { showToast } = useToast();

  const handleSubmit = async (values: UpdateReviewValues) => {
    try {
      await reviewService.updateReview(review.locationId, review._id, {
        rating: values.rating,
        comment: values.comment || "",
        visitDate: new Date(values.visitDate),
      });
      showToast("Değerlendirme başarıyla güncellendi", "success");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating review:", error);
      showToast("Değerlendirme güncellenirken bir hata oluştu", "error");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-4"
                >
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Değerlendirmeyi Düzenle
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <Formik
                  initialValues={{
                    rating: review.rating,
                    comment: review.comment,
                    visitDate: review.visitDate.split("T")[0],
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, setFieldValue }) => (
                    <Form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Yorum
                        </label>
                        <textarea
                          name="comment"
                          value={values.comment}
                          onChange={(e) =>
                            setFieldValue("comment", e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                        {errors.comment && touched.comment && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.comment}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ziyaret Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="visitDate"
                          value={values.visitDate}
                          onChange={(e) =>
                            setFieldValue("visitDate", e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.visitDate && touched.visitDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.visitDate}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <RatingInput
                          label="Genel Değerlendirme"
                          name="rating.overall"
                          value={values.rating.overall}
                          onChange={(value) =>
                            setFieldValue("rating.overall", value)
                          }
                        />
                        <RatingInput
                          label="Lezzet"
                          name="rating.taste"
                          value={values.rating.taste}
                          onChange={(value) =>
                            setFieldValue("rating.taste", value)
                          }
                          isRequired
                        />
                        <RatingInput
                          label="Servis"
                          name="rating.service"
                          value={values.rating.service}
                          onChange={(value) =>
                            setFieldValue("rating.service", value)
                          }
                          isRequired
                        />
                        <RatingInput
                          label="Ambiyans"
                          name="rating.ambiance"
                          value={values.rating.ambiance}
                          onChange={(value) =>
                            setFieldValue("rating.ambiance", value)
                          }
                          isRequired
                        />
                        <RatingInput
                          label="Fiyat/Performans"
                          name="rating.pricePerformance"
                          value={values.rating.pricePerformance}
                          onChange={(value) =>
                            setFieldValue("rating.pricePerformance", value)
                          }
                          isRequired
                        />
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          onClick={onClose}
                        >
                          Vazgeç
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          Güncelle
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
