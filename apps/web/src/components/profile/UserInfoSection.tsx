import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userService, User } from "@/services/user.service";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/utils";
import { User as UserIcon } from "lucide-react";

export default function UserInfoSection() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userData] = await Promise.all([
          userService.getUserByUsername(username as string),
        ]);

        setUser(userData);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Bilinmeyen hata";
        console.error("Kullanıcı profili yüklenirken hata oluştu:", err);
        setError(
          errorMessage || "Kullanıcı profili yüklenirken bir hata oluştu"
        );
        showToast("Kullanıcı profili yüklenirken bir hata oluştu", "error");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Kullanıcı Bilgileri
          </h2>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Kullanıcı Bilgileri
          </h2>
        </div>
        <div className="text-center p-8 text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="h-6 w-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Kullanıcı Bilgileri
          </h2>
        </div>
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          <p>Kullanıcı bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800  py-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="h-6 w-6 text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Kullanıcı Bilgileri
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user.createdAt && (
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Üyelik Tarihi
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {formatDate(user.createdAt)}
            </p>
          </div>
        )}

        {user.lastLogin && (
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Son Giriş
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {formatDate(user.lastLogin)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
