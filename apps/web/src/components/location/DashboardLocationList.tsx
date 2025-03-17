"use client";

import { useEffect, useState } from "react";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { LocationModal } from "./LocationModal";
import {
  getCategoryLabel,
  getCategoryImage,
  CategoryType,
} from "@/constants/categories";
import Image from "next/image";
import Link from "next/link";

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface DashboardLocationListProps {
  refreshTrigger?: number;
}

export function DashboardLocationList({
  refreshTrigger = 0,
}: DashboardLocationListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, [refreshTrigger]);

  const fetchLocations = async () => {
    try {
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || "Mekanlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu mekanı silmek istediğinizden emin misiniz?")) {
      try {
        await locationService.deleteLocation(id);
        setLocations(locations.filter((loc) => loc._id !== id));
      } catch (error) {
        const apiError = error as ApiError;
        console.error("Error deleting location:", error);
        alert(
          apiError.response?.data?.message || "Mekan silinirken bir hata oluştu"
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-64"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center py-4">
        {error}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Henüz mekan eklenmemiş
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <div
            key={location._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <Link href={`/locations/${location._id}`}>
              <div className="relative h-48 w-full">
                <Image
                  src={location.imageUrl || getCategoryImage(location.category)}
                  alt={location.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Link
                  href={`/locations/${location._id}`}
                  className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {location.name}
                </Link>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(location._id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {getCategoryLabel(location.category as CategoryType)}
                </p>
                <p className="mt-1">
                  {location.address.city}, {location.address.district}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLocation(null);
        }}
        location={selectedLocation || undefined}
      />
    </>
  );
}
