"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/location/SearchBar";
import { CategoryFilter } from "@/components/location/CategoryFilter";
import { LocationList } from "@/components/location/LocationList";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import type { CategoryType } from "@/constants/categories";

export default function HomePage() {
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "">(
    ""
  );
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch = searchQuery
        ? location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.city
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          location.address.district
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory = selectedCategory
        ? location.category === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  const handleCategoryChange = (category: CategoryType | "") => {
    setSelectedCategory(category);
  };

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Mekanları Keşfet
        </h1>

        <div className="space-y-4">
          <SearchBar />

          <CategoryFilter
            selectedCategory={selectedCategory}
            onChange={handleCategoryChange}
          />

          <LocationList locations={filteredLocations} loading={loading} />
        </div>
      </div>
    </main>
  );
}
