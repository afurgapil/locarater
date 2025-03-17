"use client";

import { useEffect, useState } from "react";
import { locationService } from "@/services/location.service";
import { Location } from "@/types/location";
import { DashboardLocationCard } from "./DashboardLocationCard";

interface DashboardLocationListProps {
  refreshTrigger?: number;
}

export function DashboardLocationList({
  refreshTrigger = 0,
}: DashboardLocationListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationService.getUserLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Henüz mekan eklememişsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((location) => (
        <DashboardLocationCard
          key={location._id}
          location={location}
          onDelete={async () => {
            try {
              await locationService.deleteLocation(location._id);
              setLocations(locations.filter((l) => l._id !== location._id));
            } catch (error) {
              console.error("Error deleting location:", error);
            }
          }}
        />
      ))}
    </div>
  );
}
