"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  name: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const initialValues: RegisterFormValues = {
    username: "",
    email: "",
    password: "",
    name: "",
  };

  const validate = (values: RegisterFormValues) => {
    const errors: Partial<RegisterFormValues> = {};

    if (!values.username) {
      errors.username = "Kullanıcı adı zorunludur";
    } else if (values.username.length < 2) {
      errors.username = "Kullanıcı adı en az 2 karakter olmalıdır";
    }
    if (!values.name) {
      errors.name = "İsim zorunludur";
    } else if (values.name.length < 2) {
      errors.name = "İsim en az 2 karakter olmalıdır";
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

    return errors;
  };

  const handleSubmit = async (
    values: RegisterFormValues,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      setStatus: (status: string) => void;
    }
  ) => {
    try {
      const response = await authService.register(values);
      setUser(response.user);
      setToken(response.token);
      router.push("/dashboard");
    } catch (error) {
      setStatus("Kayıt olurken bir hata oluştu");
      console.error("Register error:", error);
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
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {status}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Ad Soyad
            </label>
            <Field
              id="name"
              name="name"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <ErrorMessage
              name="name"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Kullanıcı Adı
            </label>
            <Field
              id="username"
              name="username"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <ErrorMessage
              name="username"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Şifre
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
