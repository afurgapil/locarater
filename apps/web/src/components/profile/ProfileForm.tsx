"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await profileService.getProfile();
        setProfile({
          name: data.name,
          email: data.email,
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
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
