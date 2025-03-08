"use client";

import { useState } from "react";
import { Location } from "@/types/location";
import { AdminLocationCard } from "./AdminLocationCard";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";

interface AdminLocationListProps {
  locations: Location[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function AdminLocationList({
  locations,
  isLoading,
  onDelete,
}: AdminLocationListProps) {
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setLocationToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (locationToDelete) {
      await onDelete(locationToDelete);
      setLocationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
          Henüz hiç lokasyon bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Lokasyon
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Kategori
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Adres
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Ekleyen
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Değerlendirme
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {locations.map((location) => (
              <AdminLocationCard
                key={location._id}
                location={location}
                onDeleteClick={() => handleDeleteClick(location._id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        isOpen={!!locationToDelete}
        onClose={() => setLocationToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Lokasyonu Sil"
        message="Bu lokasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}
