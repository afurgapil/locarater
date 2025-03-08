"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { authService } from "@/services/auth.service";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

interface ResetPasswordValues {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "success"
  >("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Geçersiz şifre sıfırlama bağlantısı");
      return;
    }

    const validateToken = async () => {
      try {
        await authService.validateResetToken(token);
        setStatus("valid");
      } catch (error) {
        setStatus("invalid");
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        setMessage(
          errorResponse.response?.data?.message ||
            "Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı"
        );
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (
    values: ResetPasswordValues,
    {
      setSubmitting,
      setStatus: setFormStatus,
    }: FormikHelpers<ResetPasswordValues>
  ) => {
    try {
      if (!token) {
        setFormStatus("Token bulunamadı");
        return;
      }

      await authService.resetPassword({
        token,
        ...values,
      });

      setStatus("success");
      setMessage("Şifreniz başarıyla sıfırlandı");

      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      setFormStatus(
        errorResponse.response?.data?.message ||
          "Şifre sıfırlama işlemi sırasında bir hata oluştu"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Şifre Sıfırlama
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Token doğrulanıyor...
              </p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircleIcon className="h-16 w-16 text-red-500" />
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <div className="mt-4 flex flex-col space-y-2">
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Şifre Sıfırlama Bağlantısı İste
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz...
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Giriş Sayfasına Git
              </Link>
            </div>
          )}

          {status === "valid" && (
            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validate={(values) => {
                const errors: Partial<ResetPasswordValues> = {};
                if (!values.password) {
                  errors.password = "Şifre zorunludur";
                } else if (values.password.length < 6) {
                  errors.password = "Şifre en az 6 karakter olmalıdır";
                }

                if (!values.confirmPassword) {
                  errors.confirmPassword = "Şifre tekrarı zorunludur";
                } else if (values.confirmPassword !== values.password) {
                  errors.confirmPassword = "Şifreler eşleşmiyor";
                }

                return errors;
              }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status: formStatus }) => (
                <Form className="space-y-6">
                  {formStatus && (
                    <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-200 p-4 rounded-md text-sm">
                      {formStatus}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Yeni Şifre
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 text-sm text-red-500 dark:text-red-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Şifre Tekrarı
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="mt-1 text-sm text-red-500 dark:text-red-400"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
                    >
                      {isSubmitting ? "İşleniyor..." : "Şifremi Sıfırla"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Logo />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Şifre Sıfırlama
            </h2>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Yükleniyor...
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
