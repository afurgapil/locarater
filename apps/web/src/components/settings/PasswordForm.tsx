"use client";

import { Formik, Form, Field } from "formik";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/useAuthStore";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function PasswordForm() {
  const { showToast } = useToast();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Formik<PasswordFormValues>
      initialValues={{
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validate={(values) => {
        const errors: PasswordFormErrors = {};
        if (values.newPassword !== values.confirmPassword) {
          errors.confirmPassword = "Şifreler eşleşmiyor";
        }
        return errors;
      }}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await profileService.changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          });

          showToast(
            "Şifre başarıyla güncellendi. Lütfen tekrar giriş yapın.",
            "success"
          );
          resetForm();

          setTimeout(() => {
            logout();
            router.push("/");
          }, 2000);
        } catch {
          showToast("Şifre güncellenirken bir hata oluştu", "error");
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors }) => (
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Mevcut Şifre <span className="text-red-500">*</span>
            </label>
            <Field
              type="password"
              name="currentPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Yeni Şifre <span className="text-red-500">*</span>
            </label>
            <Field
              type="password"
              name="newPassword"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Yeni Şifre (Tekrar) <span className="text-red-500">*</span>
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
