"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";

export function ProfileForm() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const { showToast } = useToast();

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await profileService.updateProfile({
            ...values,
            avatar: avatar || undefined,
          });
          showToast("Profil başarıyla güncellendi", "success");
        } catch (error) {
          showToast("Profil güncellenirken bir hata oluştu", "error");
          console.error("Profil güncellenirken bir hata oluştu", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Profil Fotoğrafı
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Ad Soyad
            </label>
            <Field
              type="text"
              name="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              E-posta
            </label>
            <Field
              type="email"
              name="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
