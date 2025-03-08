"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { authService } from "@/services/auth.service";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface ResendVerificationValues {
  email: string;
}

export default function ResendVerificationPage() {
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (
    values: ResendVerificationValues,
    {
      setSubmitting,
      setStatus,
      setFieldError,
    }: FormikHelpers<ResendVerificationValues>
  ) => {
    try {
      const response = await authService.resendVerification(values.email);
      setSuccess(true);
      setMessage(response.message || "Doğrulama emaili tekrar gönderildi.");
    } catch (error) {
      console.error("Resend verification error:", error);
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        errorResponse.response?.data?.message ||
        "Doğrulama emaili gönderilirken bir hata oluştu.";

      if (errorMessage.includes("kullanıcı bulunamadı")) {
        setFieldError(
          "email",
          "Bu email adresi ile kayıtlı kullanıcı bulunamadı"
        );
      } else if (errorMessage.includes("zaten doğrulanmış")) {
        setFieldError("email", "Bu email adresi zaten doğrulanmış");
      } else {
        setStatus(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Doğrulama Emailini Tekrar Gönder
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Hesabınızı doğrulamak için email adresinize yeni bir doğrulama
          bağlantısı gönderin.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
              <p className="text-gray-600 dark:text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lütfen email kutunuzu kontrol edin ve doğrulama bağlantısına
                tıklayın.
              </p>
              <div className="mt-4 flex space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          ) : (
            <Formik
              initialValues={{ email: "" }}
              validate={(values) => {
                const errors: { email?: string } = {};
                if (!values.email) {
                  errors.email = "Email adresi zorunludur";
                } else if (
                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                  errors.email = "Geçerli bir email adresi giriniz";
                }
                return errors;
              }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className="space-y-6">
                  {status && (
                    <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-200 p-4 rounded-md text-sm">
                      {status}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Email Adresi
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                    <ErrorMessage
                      name="email"
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
                      {isSubmitting
                        ? "Gönderiliyor..."
                        : "Doğrulama Emailini Gönder"}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <Link
                      href="/auth/login"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Giriş sayfasına dön
                    </Link>
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
