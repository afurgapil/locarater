"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { authService, UpdateRoleCredentials } from "@/services/auth.service";

interface ResultState {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    username?: string;
    role?: string;
  };
}

const UserRoleManagement = () => {
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | "BUSINESS_OWNER">("USER");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      toast.error("Lütfen bir kullanıcı adı veya email adresi girin");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const credentials: UpdateRoleCredentials = {
        identifier,
        role,
      };

      const response = await authService.updateUserRole(credentials);

      setResult({
        success: true,
        message: response.message,
        user: response.user,
      });

      toast.success("Kullanıcı rolü başarıyla güncellendi");
    } catch (error: unknown) {
      console.error("Rol güncelleme hatası:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Rol güncellenirken bir hata oluştu";

      setResult({
        success: false,
        message: errorMessage,
      });

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Kullanıcı adı veya email adresi girerek kullanıcının rolünü
        güncelleyebilirsiniz.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Kullanıcı Adı veya Email
          </label>
          <input
            id="identifier"
            type="text"
            placeholder="Kullanıcı adı veya email adresi"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Rol
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "USER" | "ADMIN" | "BUSINESS_OWNER")
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="USER">Kullanıcı</option>
            <option value="ADMIN">Yönetici</option>
            <option value="BUSINESS_OWNER">İşletme Sahibi</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "İşleniyor..." : "Rolü Güncelle"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 p-4 rounded-md ${
            result.success
              ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100"
              : "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100"
          }`}
        >
          <p className="font-medium">{result.message}</p>
          {result.success && result.user && (
            <div className="mt-2 text-sm">
              <p>
                <span className="font-semibold">Kullanıcı:</span>{" "}
                {result.user.name}
              </p>
              {result.user.username && (
                <p>
                  <span className="font-semibold">Kullanıcı Adı:</span>{" "}
                  {result.user.username}
                </p>
              )}
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {result.user.email}
              </p>
              <p>
                <span className="font-semibold">Yeni Rol:</span>{" "}
                {result.user.role}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;
