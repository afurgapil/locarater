"use client";

import { useState } from "react";
import { DashboardLocationList } from "@/components/dashboard/DashboardLocationList";
import { AddLocationDialog } from "@/components/location/AddLocationDialog";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function MyLocationsPage() {
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLocationAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Mekanlarım
        </h1>
        <button
          onClick={() => setIsAddLocationOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Yeni Mekan Ekle
        </button>
      </div>

      <DashboardLocationList refreshTrigger={refreshTrigger} />

      <AddLocationDialog
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        onSuccess={handleLocationAdded}
      />
    </div>
  );
}
