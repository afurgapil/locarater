import { useState } from "react";
import Link from "next/link";
import { Location } from "@/types/location";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { EditLocationDialog } from "../location/EditLocationDialog";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";

interface DashboardLocationCardProps {
  location: Location;
  onDelete: () => Promise<void>;
}

export function DashboardLocationCard({
  location,
  onDelete,
}: DashboardLocationCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                <Link
                  href={`/locations/${location._id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {location.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {location.address.district}, {location.address.city}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">
                {location.category}
              </span>
              <span className="mx-2">•</span>
              <span>{location.reviews?.length || 0} değerlendirme</span>
            </div>
          </div>
        </div>
      </div>

      <EditLocationDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        location={location}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={onDelete}
        title="Mekanı Sil"
        message="Bu mekanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}
