"use client";

import { LocationCard } from "./LocationCard";
import type { Location } from "@/types/location";

interface LocationListProps {
  locations: Location[];
  loading: boolean;
}

export function LocationList({ locations, loading }: LocationListProps) {
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

  if (locations.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        Sonuç bulunamadı
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
