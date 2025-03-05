"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { UserStats } from "@/components/profile/UserStats";
import { profileService } from "@/services/profile.service";

export default function ProfilePage() {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Profil Ayarları
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sol Kolon - Profil Bilgileri */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Profil Bilgileri
            </h2>
            <ProfileForm />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Şifre Değiştir
            </h2>
            <PasswordForm />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Hesap Yönetimi
            </h2>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Hesabı Sil
            </button>
          </div>
        </div>

        {/* Sağ Kolon - İstatistikler */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Aktivite Özeti
          </h2>
          <UserStats />
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            await profileService.deleteAccount();
            router.push("/auth/login");
          } catch (error) {
            console.error("Error deleting account:", error);
          }
        }}
      />
    </div>
  );
}
