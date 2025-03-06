"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
            >
              Ana Sayfa
            </Link>
            {isAuthenticated() && (
              <Link
                href="/dashboard"
                className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated() ? (
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Çıkış Yap
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
