"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MapPinIcon,
  StarIcon,
  UserIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { LocationModal } from "../location/LocationModal";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Ana Sayfa", href: "/dashboard", icon: HomeIcon },
    { name: "Mekanlar", href: "/dashboard/locations", icon: MapPinIcon },
    {
      name: "Değerlendirmeler",
      href: "/dashboard/reviews",
      icon: StarIcon,
    },
    { name: "Profil", href: "/dashboard/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Locarater
              </h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      pathname === item.href
                        ? "text-gray-500 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <div className="mx-auto flex flex-col md:px-8 xl:px-0">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            <div className="flex flex-1 justify-between px-4 md:px-0">
              <div className="flex flex-1">
                {/* Mobil menü butonu buraya eklenebilir */}
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                  Yeni Mekan Ekle
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1">
            <div className="py-6">
              <div className="px-4 sm:px-6 md:px-0">{children}</div>
            </div>
          </main>
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
