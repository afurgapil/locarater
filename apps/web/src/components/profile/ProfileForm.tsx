"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/services/auth.service";
import Image from "next/image";

interface ProfileData {
  name: string;
  email: string;
  username: string;
  imageUrl?: string;
  role: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  username: string;
  image?: File;
}

export function ProfileForm() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    username: "",
    role: "",
    isVerified: false,
    createdAt: "",
    updatedAt: "",
  });
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    username: "",
  });
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user) as User | null;
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) {
          setLoading(false);
          showToast("Kullanıcı bilgileri bulunamadı", "error");
          return;
        }

        setLoading(true);
        const userId = user._id;
        if (!userId) {
          console.error("Kullanıcı ID'si bulunamadı:", user);
          setLoading(false);
          showToast("Kullanıcı ID'si bulunamadı", "error");
          return;
        }

        const data = await profileService.getProfile(userId);

        const profileData = {
          name: data.name || "",
          email: data.email || "",
          username: data.username || "",
          role: data.role || "",
          isVerified: data.isVerified || false,
          imageUrl: data.imageUrl,
          lastLogin: data.lastLogin,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        setProfile(profileData);
        setFormData({
          name: profileData.name,
          email: profileData.email,
          username: profileData.username,
        });

        if (profileData.imageUrl) {
          setImagePreview(profileData.imageUrl);
        }
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await profileService.updateProfile({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        image: formData.image,
      });

      const newProfileData = {
        ...profile,
        name: updatedProfile.name,
        email: updatedProfile.email,
        username: updatedProfile.username,
        imageUrl: updatedProfile.imageUrl,
        updatedAt: updatedProfile.updatedAt,
      };

      setProfile(newProfileData);

      if (user) {
        const updatedUser: User = {
          ...user,
          name: updatedProfile.name,
          email: updatedProfile.email,
          username: updatedProfile.username,
          imageUrl: updatedProfile.imageUrl,
          updatedAt: updatedProfile.updatedAt,
        };
        updateUser(updatedUser);
      }

      showToast("Profil başarıyla güncellendi", "success");
    } catch (error) {
      console.error("Profil güncellenirken bir hata oluştu", error);
      showToast("Profil güncellenirken bir hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
            {imagePreview || profile.imageUrl ? (
              <Image
                src={imagePreview || profile.imageUrl || ""}
                alt="Profil resmi"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-4xl text-gray-500 dark:text-gray-400">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
              <span>Profil Resmi Seç</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Ad Soyad
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              E-posta
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Rol
            </label>
            <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {profile.role}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Güncelleniyor..." : "Profili Güncelle"}
          </button>
        </div>
      </form>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Hesap Bilgileri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              Hesap Durumu:
            </span>
            <span className="ml-2 inline-flex items-center">
              {profile.isVerified ? (
                <>
                  <span className="text-green-600 dark:text-green-400">
                    Doğrulanmış
                  </span>
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400 ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">
                  Doğrulanmamış
                </span>
              )}
            </span>
          </div>
          {profile.lastLogin && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Son Giriş:
              </span>
              <span className="ml-2">{formatDate(profile.lastLogin)}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              Kayıt Tarihi:
            </span>
            <span className="ml-2">{formatDate(profile.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              Son Güncelleme:
            </span>
            <span className="ml-2">{formatDate(profile.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
