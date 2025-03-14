"use client";

import { Formik, Form, Field } from "formik";
import { locationService } from "@/services/location.service";
import { reviewService } from "@/services/review.service";
import type { Location } from "@/types/location";
import { CATEGORIES, CategoryType } from "@/constants/categories";
import { FormikHelpers } from "formik";
import Image from "next/image";
import { useState } from "react";

interface LocationFormValues {
  name: string;
  category: CategoryType;
  address: {
    city: string;
    district: string;
  };
  image?: File;
  initialReview?: {
    rating: {
      overall: number;
      taste: number;
      service: number;
      ambiance: number;
      pricePerformance: number;
    };
    comment: string;
    visitDate?: Date;
  };
}

interface LocationFormProps {
  location?: Location;
  onSuccess?: () => void;
}

type FormikValues = LocationFormValues & { submit?: string };

export function LocationForm({ location, onSuccess }: LocationFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    location?.imageUrl || null
  );

  const initialValues: FormikValues = {
    name: location?.name || "",
    category: location?.category || CATEGORIES[0].value,
    address: {
      city: location?.address?.city || "",
      district: location?.address?.district || "",
    },
    initialReview: {
      rating: {
        overall: 5,
        taste: 5,
        service: 5,
        ambiance: 5,
        pricePerformance: 5,
      },
      comment: "",
      visitDate: new Date(),
    },
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (
    values: FormikValues,
    { setSubmitting, resetForm, setErrors }: FormikHelpers<FormikValues>
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const locationData = {
        name: values.name,
        category: values.category,
        address: values.address,
        image: values.image,
      };

      if (location) {
        await locationService.updateLocation(location._id, locationData);
      } else {
        const newLocation = await locationService.createLocation(locationData);

        if (values.initialReview && values.initialReview.comment.trim()) {
          await reviewService.addReview(values.initialReview, newLocation._id);
        }
      }

      resetForm();
      setPreviewUrl(null);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving location:", error);
      if (error instanceof Error) {
        setErrors({
          submit: error.message || "Bir hata oluştu",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<FormikValues> initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting, errors, setFieldValue }) => (
        <Form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Mekan Adı
            </label>
            <Field
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Kategori
            </label>
            <Field
              as="select"
              id="category"
              name="category"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="">Kategori Seçin</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Field>
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Mekan Fotoğrafı
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => handleImageChange(e, setFieldValue)}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-gray-700 dark:file:text-gray-200"
            />
            {previewUrl && (
              <div className="mt-2 relative w-full h-48">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="address.city"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Şehir
              </label>
              <Field
                type="text"
                id="address.city"
                name="address.city"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="address.district"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                İlçe
              </label>
              <Field
                type="text"
                id="address.district"
                name="address.district"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              İlk Değerlendirmenizi Ekleyin
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  "overall",
                  "taste",
                  "service",
                  "ambiance",
                  "pricePerformance",
                ].map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={`initialReview.rating.${field}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      {field === "overall"
                        ? "Genel Puan"
                        : field === "taste"
                          ? "Lezzet"
                          : field === "service"
                            ? "Servis"
                            : field === "ambiance"
                              ? "Ambiyans"
                              : "Fiyat/Performans"}
                    </label>
                    <Field
                      type="number"
                      min="1"
                      max="5"
                      id={`initialReview.rating.${field}`}
                      name={`initialReview.rating.${field}`}
                      inputMode="numeric"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  htmlFor="initialReview.comment"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Yorumunuz
                </label>
                <Field
                  as="textarea"
                  id="initialReview.comment"
                  name="initialReview.comment"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="initialReview.visitDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Ziyaret Tarihi
                </label>
                <Field
                  type="date"
                  id="initialReview.visitDate"
                  name="initialReview.visitDate"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="text-red-600 text-sm">{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          >
            {isSubmitting
              ? "Kaydediliyor..."
              : location
                ? "Güncelle"
                : "Kaydet"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
