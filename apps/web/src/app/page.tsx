import { LocationList } from "@/components/location/LocationList";
import { SearchBar } from "@/components/location/SearchBar";
import { CategoryFilter } from "@/components/location/CategoryFilter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              En İyi Mekanları Keşfedin
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Çevrenizdeki en iyi mekanları bulun, değerlendirin ve paylaşın
            </p>
          </div>

          {/* Search & Filter */}
          <div className="space-y-4">
            <SearchBar />
            <CategoryFilter />
          </div>

          {/* Locations */}
          <LocationList />
        </div>
      </div>
    </div>
  );
}
