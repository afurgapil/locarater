"use client";

import { useEffect, useState } from "react";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { LocationModal } from "./LocationModal";

export function DashboardLocationList() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu mekanı silmek istediğinizden emin misiniz?")) {
      try {
        await locationService.deleteLocation(id);
        setLocations(locations.filter((loc) => loc._id !== id));
      } catch (error: any) {
        console.error("Error deleting location:", error);
        alert(
          error.response?.data?.message || "Mekan silinirken bir hata oluştu"
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
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-24"
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {location.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(location._id)}
                  className="text-red-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>{location.category}</p>
              <p>
                {location.address.city}, {location.address.district}
              </p>
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
