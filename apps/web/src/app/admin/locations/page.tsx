"use client";

import { useState, useEffect } from "react";
import { locationService } from "@/services/location.service";
import { Location } from "@/types/location";
import { AdminLocationList } from "@/components/admin/AdminLocationList";
import { useToast } from "@/hooks/useToast";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError("Lokasyonlar yüklenirken bir hata oluştu");
      showToast("Lokasyonlar yüklenirken bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await locationService.deleteLocation(id);
      setLocations(locations.filter((location) => location._id !== id));
      showToast("Lokasyon başarıyla silindi", "success");
    } catch (error) {
      console.error("Error deleting location:", error);
      setError("Lokasyon silinirken bir hata oluştu");
      showToast("Lokasyon silinirken bir hata oluştu", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Tüm Lokasyonlar
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <AdminLocationList
        locations={locations}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
