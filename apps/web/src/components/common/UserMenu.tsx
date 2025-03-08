import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span className="sr-only">Kullanıcı menüsünü aç</span>
          <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
            <UserIcon className="h-5 w-5" />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username}
            </p>
            <div className="flex items-center mt-1">
              {user?.isVerified ? (
                <div className="flex items-center text-green-500 text-xs">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  <span>Doğrulanmış</span>
                </div>
              ) : (
                <Link
                  href="/auth/resend-verification"
                  className="flex items-center text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 text-xs"
                >
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  <span>Doğrulanmamış - Doğrula</span>
                </Link>
              )}
            </div>
          </div>

          <Menu.Item>
            {({ active }) => (
              <Link
                href="/dashboard"
                className={`${
                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Profilim</span>
                </div>
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <Link
                href="/dashboard/settings"
                className={`${
                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
              >
                <div className="flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  <span>Ayarlar</span>
                </div>
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={`${
                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  <span>Çıkış Yap</span>
                </div>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
