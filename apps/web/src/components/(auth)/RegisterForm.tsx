"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { RegisterCredentials } from "@/services/auth.service";
import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

type RegisterFormValues = RegisterCredentials;

export function RegisterForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const initialValues: RegisterFormValues = {
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validate = (values: RegisterFormValues) => {
    const errors: Partial<RegisterFormValues> = {};

    if (!values.name) {
      errors.name = "İsim zorunludur";
    } else if (values.name.length < 2) {
      errors.name = "İsim en az 2 karakter olmalıdır";
    }

    if (!values.username) {
      errors.username = "Kullanıcı adı zorunludur";
    } else if (values.username.length < 3) {
      errors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      errors.username =
        "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir";
    }

    if (!values.email) {
      errors.email = "Email adresi zorunludur";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Geçerli bir email adresi giriniz";
    }

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
  };

  const handleSubmit = async (
    values: RegisterFormValues,
    {
      setSubmitting,
      setStatus,
      setFieldError,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setStatus: (status: string) => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    try {
      const response = await authService.register(values);
      setUser({
        _id: response.user._id,
        email: response.user.email,
        name: response.user.name,
        username: response.user.username,
        role: response.user.role,
        isVerified: response.user.isVerified,
        imageUrl: response.user.imageUrl,
        lastLogin: response.user.lastLogin,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
        isActive: response.user.isActive,
        followers: response.user.followers,
        following: response.user.following,
      });
      setToken(response.token);

      setUserEmail(values.email);
      setRegistrationSuccess(true);

      if (response.user.isVerified) {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error("Register error:", error);

      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        errorResponse.response?.data?.message ||
        "Kayıt olurken bir hata oluştu";

      if (errorMessage.includes("email adresi zaten kullanımda")) {
        setFieldError("email", "Bu email adresi zaten kullanımda");
        setStatus("Lütfen farklı bir email adresi kullanın");
      } else if (errorMessage.includes("kullanıcı adı zaten kullanımda")) {
        setFieldError("username", "Bu kullanıcı adı zaten kullanımda");
        setStatus("Lütfen farklı bir kullanıcı adı kullanın");
      } else {
        setStatus(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
          <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
          Kayıt Başarılı!
        </h3>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <p>
            <strong>{userEmail}</strong> adresine bir doğrulama emaili
            gönderdik.
          </p>
          <p className="mt-1">
            Lütfen email kutunuzu kontrol edin ve hesabınızı doğrulamak için
            emaildeki bağlantıya tıklayın.
          </p>
        </div>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Dashboard&apos;a Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
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
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <Field
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <ErrorMessage
              name="name"
              component="div"
              className="mt-1 text-sm text-red-500 dark:text-red-400"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Kullanıcı Adı <span className="text-red-500">*</span>
            </label>
            <Field
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <ErrorMessage
              name="username"
              component="div"
              className="mt-1 text-sm text-red-500 dark:text-red-400"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email <span className="text-red-500">*</span>
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Şifre <span className="text-red-500">*</span>
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
              Şifre Tekrarı <span className="text-red-500">*</span>
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
              {isSubmitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
