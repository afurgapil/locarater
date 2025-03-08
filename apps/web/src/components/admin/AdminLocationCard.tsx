"use client";

import Link from "next/link";
import { Location } from "@/types/location";
import { TrashIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { getCategoryLabel } from "@/constants/categories";

interface AdminLocationCardProps {
  location: Location;
  onDeleteClick: () => void;
}

export function AdminLocationCard({
  location,
  onDeleteClick,
}: AdminLocationCardProps) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {location.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {getCategoryLabel(location.category)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {location.address.district}, {location.address.city}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {location.createdBy.name || location.createdBy.username}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {location.ratings?.average.toFixed(1) || "0.0"} (
          {location.reviewCount || 0})
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Link
            href={`/locations/${location._id}`}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link
            href={`/admin/locations/edit/${location._id}`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={onDeleteClick}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
