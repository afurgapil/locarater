"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import NotificationButton from "@/components/notifications/NotificationButton";

export function Header({
  showDashboardLink = true,
}: {
  showDashboardLink?: boolean;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow fixed w-full top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold text-blue-600"
            >
              Locarater
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            {user && <NotificationButton />}
            <button
              className="flex items-center p-2 ml-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationButton />}
            {user ? (
              <>
                <Link
                  href="/feed"
                  className="text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Akış
                </Link>
                {showDashboardLink && (
                  <Link
                    href="/dashboard"
                    className="text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Arayüz
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-2 pb-3 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <>
                {showDashboardLink && (
                  <>
                    <Link
                      href="/feed"
                      className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Akış
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Arayüz
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              </>
            )}
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
