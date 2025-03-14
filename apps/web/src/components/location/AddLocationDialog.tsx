"use client";

import { Dialog } from "@headlessui/react";
import { Formik, Form, Field } from "formik";
import { locationService } from "@/services/location.service";
import { useToast } from "@/hooks/useToast";
import { CATEGORIES } from "@/constants/categories";
import * as Yup from "yup";
import Image from "next/image";
import { useState } from "react";

interface AddLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocationFormValues {
  name: string;
  category: string;
  address: {
    city: string;
    district: string;
  };
  image?: File;
}

const LocationSchema = Yup.object().shape({
  name: Yup.string().required("Mekan adı zorunludur"),
  category: Yup.string().required("Kategori seçimi zorunludur"),
  address: Yup.object().shape({
    city: Yup.string().required("Şehir bilgisi zorunludur"),
    district: Yup.string().required("İlçe bilgisi zorunludur"),
  }),
});

export function AddLocationDialog({ isOpen, onClose }: AddLocationDialogProps) {
  const { showToast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initialValues: LocationFormValues = {
    name: "",
    category: CATEGORIES[0].value,
    address: {
      city: "",
      district: "",
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Yeni Mekan Ekle
          </Dialog.Title>

          <Formik
            initialValues={initialValues}
            validationSchema={LocationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await locationService.createLocation(values);
                showToast("Mekan başarıyla eklendi", "success");
                onClose();
                window.location.reload();
              } catch (err) {
                console.error("Error creating location:", err);
                showToast("Mekan eklenirken bir hata oluştu", "error");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mekan Adı
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                  {errors.name && touched.name && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Field>
                  {errors.category && touched.category && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mekan Fotoğrafı
                  </label>
                  <input
                    type="file"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Şehir
                  </label>
                  <Field
                    type="text"
                    name="address.city"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                  {errors.address?.city && touched.address?.city && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.address.city}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    İlçe
                  </label>
                  <Field
                    type="text"
                    name="address.district"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                  {errors.address?.district && touched.address?.district && (
                    <div className="mt-1 text-sm text-red-600">
                      {errors.address.district}
                    </div>
                  )}
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
                    {isSubmitting ? "Ekleniyor..." : "Ekle"}
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
