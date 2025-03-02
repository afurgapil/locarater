"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { Location } from "@/types/location";

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={`/locations/${location._id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          {location.name}
        </h3>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>
            {location.address.city}, {location.address.district}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {location.ratings?.average?.toFixed(1) || "Yeni"}
            </span>
            <span className="mx-1 text-gray-500 dark:text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {location.ratings?.count || 0} değerlendirme
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {location.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
