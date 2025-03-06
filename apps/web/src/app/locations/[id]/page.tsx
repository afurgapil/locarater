"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { locationService } from "@/services/location.service";
import { ReviewList } from "@/components/review/ReviewList";
import { ReviewForm } from "@/components/review/ReviewForm";
import type { Location } from "@/types/location";

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.id as string;
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocationById(locationId);
      setLocation(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Mekan bilgileri yüklenirken bir hata oluştu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center py-4">
        {error || "Mekan bulunamadı"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {location.name}
          </h1>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>
              {location.address.city}, {location.address.district}
            </p>
            <p className="mt-1">{location.category}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Değerlendirmeler
            </h2>
            <div className="mt-4">
              <ReviewForm locationId={location._id} onSuccess={fetchLocation} />
            </div>
            <div className="mt-6">
              <ReviewList locationId={location._id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
