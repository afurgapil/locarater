"use client";

import { useState } from "react";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { StarIcon } from "@heroicons/react/24/solid";
import { reviewService } from "@/services/review.service";
import * as Yup from "yup";

interface ReviewFormProps {
  locationId: string;
  onSuccess?: () => void;
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
  visitDate: Date;
  images?: File[];
}

const ReviewSchema = Yup.object().shape({
  rating: Yup.object().shape({
    overall: Yup.number().required("Genel puan zorunludur").min(1).max(10),
    taste: Yup.number().min(1).max(10),
    service: Yup.number().min(1).max(10),
    ambiance: Yup.number().min(1).max(10),
    pricePerformance: Yup.number().min(1).max(10),
  }),
  comment: Yup.string()
    .required("Yorum zorunludur")
    .min(10, "En az 10 karakter yazmalısınız"),
  visitDate: Yup.date(),
});

export function ReviewForm({ locationId, onSuccess }: ReviewFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues: ReviewFormValues = {
    rating: {
      overall: 0,
      taste: 0,
      service: 0,
      ambiance: 0,
      pricePerformance: 0,
    },
    comment: "",
    visitDate: new Date(),
  };

  const handleSubmit = async (
    formData: ReviewFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ReviewFormValues>
  ) => {
    try {
      await reviewService.addReview(formData, locationId);
      resetForm();
      setSubmitError(null);
      if (onSuccess) {
        window.location.reload();
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating review:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Değerlendirme eklenirken bir hata oluştu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ReviewSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Genel Puan
            </label>
            <div className="flex items-center space-x-1">
              {[...Array(10)].map((_, index) => (
                <Field key={index} name="rating.overall">
                  {({
                    field,
                    form,
                  }: {
                    field: { value: number };
                    form: {
                      setFieldValue: (field: string, value: number) => void;
                    };
                  }) => (
                    <button
                      type="button"
                      className={`p-1 ${
                        field.value >= index + 1
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      onClick={() =>
                        form.setFieldValue("rating.overall", index + 1)
                      }
                    >
                      <StarIcon className="h-6 w-6" />
                    </button>
                  )}
                </Field>
              ))}
            </div>
            {errors.rating?.overall && touched.rating?.overall && (
              <div className="text-red-600 text-sm mt-1">
                {errors.rating.overall}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Lezzet
              </label>
              <Field
                type="number"
                name="rating.taste"
                min="1"
                max="10"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Servis
              </label>
              <Field
                type="number"
                name="rating.service"
                min="1"
                max="10"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Ambiyans
              </label>
              <Field
                type="number"
                name="rating.ambiance"
                min="1"
                max="10"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Fiyat/Performans
              </label>
              <Field
                type="number"
                name="rating.pricePerformance"
                min="1"
                max="10"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Yorumunuz
            </label>
            <Field
              as="textarea"
              name="comment"
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            {errors.comment && touched.comment && (
              <div className="text-red-600 text-sm mt-1">{errors.comment}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Ziyaret Tarihi
            </label>
            <Field
              type="date"
              name="visitDate"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          {submitError && (
            <div className="text-red-600 text-sm">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          >
            {isSubmitting ? "Gönderiliyor..." : "Değerlendirme Ekle"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
