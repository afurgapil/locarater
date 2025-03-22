"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import type { Location } from "@/types/location";
import { getCategoryLabel, getCategoryImage } from "@/constants/categories";
import { FavoriteButton } from "@/components/shared/FavoriteButton";

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="relative">
        <Link href={`/locations/${location._id}`}>
          <div className="relative h-40 w-full">
            <Image
              src={location.imageUrl || getCategoryImage(location.category)}
              alt={location.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              className="object-cover"
            />
          </div>
        </Link>
        <div className="absolute top-2 right-2">
          <FavoriteButton
            placeId={location._id}
            className="bg-white/10 backdrop-blur-sm"
          />
        </div>
      </div>
      <div className="p-4">
        <Link href={`/locations/${location._id}`}>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400">
            {location.name}
          </h3>
        </Link>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>
            {location.address?.city}, {location.address?.district}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {getCategoryLabel(location.category)}
          </span>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {location.ratings?.average?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
