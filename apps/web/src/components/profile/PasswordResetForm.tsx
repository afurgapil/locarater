"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/services/profile.service";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/useAuthStore";

export function PasswordResetForm() {
  const { showToast } = useToast();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Şifreler eşleşmiyor", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Şifre en az 6 karakter olmalıdır", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await profileService.resetPassword(newPassword);
      showToast(
        "Şifreniz başarıyla sıfırlandı. Lütfen tekrar giriş yapın.",
        "success"
      );
      setNewPassword("");
      setConfirmPassword("");

      // Kısa bir gecikme ekleyerek toast mesajının görünmesini sağlayalım
      setTimeout(() => {
        // Kullanıcıyı logout yap
        logout();

        // Login sayfasına yönlendir
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Şifre sıfırlanırken bir hata oluştu", error);
      showToast("Şifre sıfırlanırken bir hata oluştu", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Şifre Sıfırlama
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Bu form ile şifrenizi doğrudan sıfırlayabilirsiniz. Mevcut şifrenizi
          bilmenize gerek yoktur.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Yeni Şifre
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          minLength={6}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Yeni Şifre (Tekrar)
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          minLength={6}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {isSubmitting ? "Sıfırlanıyor..." : "Şifremi Sıfırla"}
      </button>
    </form>
  );
}
