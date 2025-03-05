import Link from "next/link";

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
          <li key={location._id} className="py-4">
            <Link href={`/locations/${location._id}`}>
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {location.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {location.reviewCount} yorum
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(location.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-yellow-400">⭐</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
        {(!locations || locations.length === 0) && (
          <li className="py-4 text-center text-gray-500 dark:text-gray-400">
            Henüz yorum yapılan mekan bulunmuyor
          </li>
        )}
      </ul>
    </div>
  );
}
