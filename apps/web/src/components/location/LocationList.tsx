"use client";

import { useEffect, useState } from "react";
import { locationService } from "@/services/location.service";
import { LocationCard } from "./LocationCard";
import type { Location } from "@/types/location";

export function LocationList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error: any) {
      setError(error.message || "Mekanlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48"
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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((location) => (
        <LocationCard key={location._id} location={location} />
      ))}
    </div>
  );
}
