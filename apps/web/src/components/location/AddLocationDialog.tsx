"use client";

import { Dialog } from "@headlessui/react";
import { Formik, Form, Field } from "formik";
import { locationService } from "@/services/location.service";
import { useToast } from "@/hooks/useToast";
import { CATEGORIES } from "@/constants/categories";
import { COUNTRIES } from "@/constants/cities";
import * as Yup from "yup";
import Image from "next/image";
import { useState, useMemo } from "react";

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

interface City {
  name: string;
  districts: string[];
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
  const [selectedCountry, setSelectedCountry] = useState<string>("TR");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const initialValues: LocationFormValues = {
    name: "",
    category: CATEGORIES[0].value,
    address: {
      city: "",
      district: "",
    },
  };

  const cities = useMemo(() => {
    const country = COUNTRIES.find(
      (country) => country.code === selectedCountry
    );
    return country ? country.cities : [];
  }, [selectedCountry]);

  const districts = useMemo(() => {
    const country = COUNTRIES.find(
      (country) => country.code === selectedCountry
    );
    const city = country?.cities.find((city) => city.name === selectedCity);
    return city ? city.districts : [];
  }, [selectedCountry, selectedCity]);

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

  const handleSubmit = async (values: LocationFormValues) => {
    try {
      await locationService.createLocation(values);
      showToast("Mekan başarıyla eklendi", "success");
      onClose();
    } catch (error) {
      console.error("Error creating location:", error);
      showToast("Mekan eklenirken bir hata oluştu", "error");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/30" />

        <Dialog.Panel className="relative mx-auto max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
            Yeni Mekan Ekle
          </Dialog.Title>

          <Formik
            initialValues={initialValues}
            validationSchema={LocationSchema}
            onSubmit={handleSubmit}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ülke
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setSelectedCountry(newCountry);
                        setSelectedCity("");
                        setFieldValue("address.city", "");
                        setFieldValue("address.district", "");
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Şehir
                    </label>
                    <Field
                      as="select"
                      name="address.city"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const newCity = e.target.value;
                        setSelectedCity(newCity);
                        setFieldValue("address.city", newCity);
                        setFieldValue("address.district", "");
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    >
                      <option value="">Şehir Seçin</option>
                      {cities.map((city: City) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </Field>
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
                      as="select"
                      name="address.district"
                      disabled={!selectedCity}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">İlçe Seçin</option>
                      {districts.map((district: string) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </Field>
                    {errors.address?.district && touched.address?.district && (
                      <div className="mt-1 text-sm text-red-600">
                        {errors.address.district}
                      </div>
                    )}
                  </div>
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
