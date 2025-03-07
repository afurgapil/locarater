"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { LoginCredentials } from "@/services/auth.service";

type LoginFormValues = LoginCredentials;

export function LoginForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const initialValues: LoginFormValues = {
    username: "",
    password: "",
  };

  const validate = (values: LoginFormValues) => {
    const errors: Partial<LoginFormValues> = {};

    if (!values.username) {
      errors.username = "Kullanıcı adı zorunludur";
    } else if (values.username.length < 3) {
      errors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
    }

    if (!values.password) {
      errors.password = "Şifre zorunludur";
    } else if (values.password.length < 6) {
      errors.password = "Şifre en az 6 karakter olmalıdır";
    }

    return errors;
  };

  const handleSubmit = async (
    values: LoginFormValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setStatus: (status: string) => void;
    }
  ) => {
    try {
      const response = await authService.login(values);
      setUser({
        _id: response.user.id,
        username: values.username,
        role: response.user.role || "USER",
      });
      setToken(response.token);
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);

      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        errorResponse.response?.data?.message ||
        "Giriş yapılırken bir hata oluştu";

      if (errorMessage.includes("Kullanıcı adı veya şifre hatalı")) {
        setStatus("Kullanıcı adı veya şifre hatalı");
      } else {
        setStatus(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Kullanıcı Adı
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
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Şifre
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
            <ErrorMessage
              name="password"
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
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
