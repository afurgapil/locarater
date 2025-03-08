"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Paneli
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/locations"
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Lokasyonlar
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Tüm lokasyonları yönetin
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Kullanıcılar
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Kullanıcıları yönetin
          </p>
        </Link>

        <Link
          href="/admin/reviews"
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            Değerlendirmeler
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Tüm değerlendirmeleri yönetin
          </p>
        </Link>
      </div>
    </div>
  );
}
