"use client";

import { Formik, Form, Field } from "formik";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import { CATEGORIES } from "@/constants/categories";

interface LocationFormValues {
  name: string;
  category: string;
  address: {
    city: string;
    district: string;
  };
}

interface LocationFormProps {
  location?: Location;
  onSuccess?: () => void;
}

export function LocationForm({ location, onSuccess }: LocationFormProps) {
  const initialValues: LocationFormValues = {
    name: location?.name || "",
    category: location?.category || "",
    address: {
      city: location?.address?.city || "",
      district: location?.address?.district || "",
    },
  };

  const handleSubmit = async (
    values: LocationFormValues,
    { setSubmitting, resetForm, setErrors }: any
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      if (location) {
        await locationService.updateLocation(location._id, values);
      } else {
        await locationService.createLocation(values);
      }
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving location:", error);
      setErrors({
        submit: error.response?.data?.message || "Bir hata oluştu",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting, errors }) => (
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
                : "Mekan Ekle"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
