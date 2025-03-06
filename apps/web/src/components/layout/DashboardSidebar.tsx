"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  MapPinIcon,
  StarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Genel Bakış", href: "/dashboard", icon: HomeIcon },
  { name: "Mekanlarım", href: "/dashboard/locations", icon: MapPinIcon },
  {
    name: "Değerlendirmelerim",
    href: "/dashboard/reviews",
    icon: StarIcon,
  },
  { name: "Profil", href: "/dashboard/profile", icon: UserIcon },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mobil menü açıkken ve ekran boyutu değiştiğinde menüyü kapat
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobil menü butonu */}
      <div className="fixed top-0 left-0 z-40 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            LocaRater
          </span>
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobil menü overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobil menü */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              LocaRater
            </span>
            <button
              type="button"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {/* Anasayfaya dönüş bağlantısı */}
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6"
              >
                <ArrowLeftIcon className="text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 mr-3 flex-shrink-0 h-6 w-6" />
                Anasayfaya Dön
              </Link>

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

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              LocaRater
            </span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {/* Anasayfaya dönüş bağlantısı */}
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6"
              >
                <ArrowLeftIcon className="text-gray-400 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 mr-3 flex-shrink-0 h-6 w-6" />
                Anasayfaya Dön
              </Link>

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
    </>
  );
}
