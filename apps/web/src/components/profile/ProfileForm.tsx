"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/services/auth.service";

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
}

export function ProfileForm() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    name: "Kullanıcı Adı",
    email: "kullanici@example.com",
  });
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user) as User | null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) {
          setLoading(false);
          showToast("Kullanıcı bilgileri bulunamadı", "error");
          return;
        }

        console.log("Current user in store:", user);

        setLoading(true);
        const userId = user._id;
        if (!userId) {
          console.error("Kullanıcı ID'si bulunamadı:", user);
          setLoading(false);
          showToast("Kullanıcı ID'si bulunamadı", "error");
          return;
        }

        const data = await profileService.getProfile(userId);
        console.log("Profile data from API:", data);

        setProfile({
          name: data.name || user.username || "İsimsiz Kullanıcı",
          email: data.email || user.email || "Email bulunamadı",
          avatar: data.avatar,
        });
      } catch (error) {
        console.error("Profil bilgileri alınırken bir hata oluştu", error);
        showToast("Profil bilgileri alınırken bir hata oluştu", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        Profil bilgilerini görüntülemek için giriş yapmalısınız.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Ad Soyad
        </label>
        <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          {profile.name}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          E-posta
        </label>
        <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          {profile.email}
        </div>
      </div>
    </div>
  );
}
