"use client";

import { useState } from "react";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { reviewService } from "@/services/review.service";
import * as Yup from "yup";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";

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
  visitDate: string;
  image?: File | null;
}

const ReviewSchema = Yup.object().shape({
  rating: Yup.object().shape({
    overall: Yup.number(),
    taste: Yup.number().required("Lezzet puanı zorunludur").min(1).max(10),
    service: Yup.number().required("Servis puanı zorunludur").min(1).max(10),
    ambiance: Yup.number().required("Ambiyans puanı zorunludur").min(1).max(10),
    pricePerformance: Yup.number()
      .required("Fiyat/Performans puanı zorunludur")
      .min(1)
      .max(10),
  }),
  comment: Yup.string().min(1, "En az 1 karakter yazmalısınız").nullable(),
  visitDate: Yup.date()
    .required("Ziyaret tarihi zorunludur")
    .max(new Date(), "Gelecek bir tarih seçemezsiniz")
    .typeError("Geçerli bir tarih giriniz"),
  image: Yup.mixed().nullable(),
});

export function ReviewForm({ locationId, onSuccess }: ReviewFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { showToast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const initialValues: ReviewFormValues = {
    rating: {
      overall: 0,
      taste: 0,
      service: 0,
      ambiance: 0,
      pricePerformance: 0,
    },
    comment: "",
    visitDate: today,
    image: null,
  };

  const calculateOverallRating = (
    ratings: ReviewFormValues["rating"]
  ): number => {
    const { taste, service, ambiance, pricePerformance } = ratings;
    const sum = taste + service + ambiance + pricePerformance;
    return Number((sum / 4).toFixed(1));
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: File | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFieldValue("image", null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (
    formData: ReviewFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ReviewFormValues>
  ) => {
    try {
      const overallRating = calculateOverallRating(formData.rating);
      const updatedFormData = {
        ...formData,
        rating: {
          ...formData.rating,
          overall: overallRating,
        },
        visitDate: new Date(formData.visitDate),
        image: formData.image || undefined,
        comment: formData.comment || "",
      };

      await reviewService.addReview(updatedFormData, locationId);
      resetForm();
      setImagePreview(null);
      setSubmitError(null);
      showToast("Değerlendirmeniz başarıyla eklendi", "success");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating review:", error);

      let errorMessage = "Değerlendirme eklenirken bir hata oluştu";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (
        errorMessage.includes("Bu mekan için zaten bir değerlendirmeniz var") ||
        errorMessage.includes("already has a review")
      ) {
        const customMessage =
          "Bu mekan için zaten bir değerlendirme yapmışsınız";
        setSubmitError(customMessage);
        showToast(customMessage, "error");
      } else {
        setSubmitError(errorMessage);
        showToast(errorMessage, "error");
      }
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
      {({ errors, touched, isSubmitting, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Lezzet <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="rating.taste"
                min="1"
                max="10"
                inputMode="numeric"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Servis <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="rating.service"
                min="1"
                max="10"
                inputMode="numeric"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Ambiyans <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="rating.ambiance"
                min="1"
                max="10"
                inputMode="numeric"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Fiyat/Performans <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="rating.pricePerformance"
                min="1"
                max="10"
                inputMode="numeric"
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
              Ziyaret Tarihi <span className="text-red-500">*</span>
            </label>
            <Field
              type="date"
              name="visitDate"
              max={today}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Fotoğraf
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setFieldValue)}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-gray-700 dark:file:text-gray-200"
            />
          </div>

          {imagePreview && (
            <div className="mt-2">
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

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
