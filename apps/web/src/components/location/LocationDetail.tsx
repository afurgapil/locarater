"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import { getCategoryLabel } from "@/constants/categories";
import { useAuthStore } from "@/store/useAuthStore";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LocationDetailProps {
  id: string;
}

export function LocationDetail({ id }: LocationDetailProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLocation = async () => {
    try {
      const data = await locationService.getLocationById(id);
      setLocation(data);
    } catch (err) {
      setError("Mekan detayları yüklenirken bir hata oluştu");
      console.error("Error fetching location:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcının lokasyonu silme yetkisi var mı kontrol et
  const canDelete =
    user &&
    location &&
    (user.role === "ADMIN" || location.createdBy._id === user._id);

  const handleDelete = async () => {
    try {
      await locationService.deleteLocation(id);
      router.push("/dashboard/locations");
    } catch (error) {
      console.error("Error deleting location:", error);
      setError("Mekan silinirken bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg animate-pulse">
        <div className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400">{error}</div>
    );
  }

  if (!location) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Mekan bulunamadı
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
        <div className="relative h-96">
          <Image
            src={location.imageUrl || "/placeholder.jpg"}
            alt={location.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {location.name}
            </h1>
            {canDelete && (
              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/locations/edit/${location._id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
              {location.averageRating.toFixed(1)} ({location.reviewCount}{" "}
              değerlendirme)
            </span>
          </div>
          <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400">
            <MapPinIcon className="h-5 w-5" />
            <span className="ml-2">
              {location.address.city}, {location.address.district}
            </span>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
              {getCategoryLabel(location.category)}
            </span>
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            {location.description}
          </p>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Mekanı Sil"
        message="Bu mekanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}
