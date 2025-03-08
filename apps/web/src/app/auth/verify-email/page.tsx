"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { updateVerificationStatus } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Doğrulama token'ı bulunamadı.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(response.message || "Email adresiniz başarıyla doğrulandı.");
        updateVerificationStatus(true);

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (error) {
        setStatus("error");
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        setMessage(
          errorResponse.response?.data?.message ||
            "Email doğrulama işlemi başarısız oldu."
        );
      }
    };

    verifyEmail();
  }, [token, router, updateVerificationStatus]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Email Doğrulama
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Email adresiniz doğrulanıyor...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <p className="text-gray-600 dark:text-gray-300">{message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Birkaç saniye içinde yönlendirileceksiniz...
                </p>
                <Link
                  href="/dashboard"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dashboard&apos;a Git
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <XCircleIcon className="h-16 w-16 text-red-500" />
                <p className="text-gray-600 dark:text-gray-300">{message}</p>
                <div className="mt-4 flex flex-col space-y-2">
                  <Link
                    href="/auth/resend-verification"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Doğrulama Emailini Tekrar Gönder
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Dashboard&apos;a Dön
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Logo />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Email Doğrulama
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
      <VerifyEmailContent />
    </Suspense>
  );
}
