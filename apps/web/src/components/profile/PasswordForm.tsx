"use client";

import { Formik, Form, Field } from "formik";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";

export function PasswordForm() {
  const { showToast } = useToast();

  return (
    <Formik
      initialValues={{
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validate={(values) => {
        const errors: any = {};
        if (values.newPassword !== values.confirmPassword) {
          errors.confirmPassword = "Şifreler eşleşmiyor";
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await profileService.updateProfile({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });
          showToast("Şifre başarıyla güncellendi", "success");
          resetForm();
        } catch (error) {
          showToast("Şifre güncellenirken bir hata oluştu", "error");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Mevcut Şifre
            </label>
            <Field
              type="password"
              name="currentPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Yeni Şifre
            </label>
            <Field
              type="password"
              name="newPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Yeni Şifre (Tekrar)
            </label>
            <Field
              type="password"
              name="confirmPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
