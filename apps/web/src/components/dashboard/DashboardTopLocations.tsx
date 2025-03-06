import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";

interface TopLocation {
  _id: string;
  name: string;
  reviewCount: number;
  averageRating: number;
}

interface DashboardTopLocationsProps {
  locations: TopLocation[];
}

export function DashboardTopLocations({
  locations = [],
}: DashboardTopLocationsProps) {
  return (
    <div className="flow-root">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {locations?.map((location) => (
          <li key={location._id} className="py-3 sm:py-4">
            <Link
              href={`/locations/${location._id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-4 sm:mx-0 px-4 sm:px-2 py-2 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">
                    {location.reviewCount}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {location.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {location.reviewCount} yorum
                  </p>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {(location.averageRating || 0).toFixed(1)}
                  </span>
                  <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                </div>
              </div>
            </Link>
          </li>
        ))}
        {(!locations || locations.length === 0) && (
          <li className="py-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Henüz yorum yapılan mekan bulunmuyor
          </li>
        )}
      </ul>
    </div>
  );
}
