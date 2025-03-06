"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import { getCategoryLabel } from "@/constants/categories";

interface LocationDetailProps {
  id: string;
}

export function LocationDetail({ id }: LocationDetailProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
      <div className="relative h-96">
        <Image
          src={location.images[0] || "/placeholder.jpg"}
          alt={location.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {location.name}
        </h1>
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
  );
}
