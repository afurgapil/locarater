"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/location/SearchBar";
import { CategoryFilter } from "@/components/location/CategoryFilter";
import { LocationList } from "@/components/location/LocationList";
import {
  SortSelect,
  sortOptions,
  type SortOption,
} from "@/components/location/SortSelect";
import { locationService } from "@/services/location.service";
import type { Location } from "@/types/location";
import type { CategoryType } from "@/constants/categories";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <h1 className="text-4xl font-bold mb-8">LocaRater</h1>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "">(
    ""
  );
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
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

  const filteredAndSortedLocations = useMemo(() => {
    const filtered = locations.filter((location) => {
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

    return [...filtered].sort((a, b) => {
      switch (selectedSort.value) {
        case "rating-desc":
          const aRating = a.ratings?.average || a.averageRating || 0;
          const bRating = b.ratings?.average || b.averageRating || 0;
          return bRating - aRating;
        case "rating-asc":
          const aRatingAsc = a.ratings?.average || a.averageRating || 0;
          const bRatingAsc = b.ratings?.average || b.averageRating || 0;
          return aRatingAsc - bRatingAsc;

        case "reviews-desc":
          const aReviews =
            a.ratings?.count || a.reviewCount || a.reviews?.length || 0;
          const bReviews =
            b.ratings?.count || b.reviewCount || b.reviews?.length || 0;
          return bReviews - aReviews;
        case "reviews-asc":
          const aReviewsAsc =
            a.ratings?.count || a.reviewCount || a.reviews?.length || 0;
          const bReviewsAsc =
            b.ratings?.count || b.reviewCount || b.reviews?.length || 0;
          return aReviewsAsc - bReviewsAsc;

        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case "name-asc":
          return a.name.localeCompare(b.name, "tr");
        case "name-desc":
          return b.name.localeCompare(a.name, "tr");

        case "city-asc":
          return a.address.city.localeCompare(b.address.city, "tr");
        case "city-desc":
          return b.address.city.localeCompare(a.address.city, "tr");
        case "district-asc":
          return a.address.district.localeCompare(b.address.district, "tr");
        case "district-desc":
          return b.address.district.localeCompare(a.address.district, "tr");

        default:
          const aRatingWeight = a.ratings?.average || a.averageRating || 0;
          const bRatingWeight = b.ratings?.average || b.averageRating || 0;
          const aReviewsWeight = Math.log(
            a.ratings?.count || a.reviewCount || a.reviews?.length || 1
          );
          const bReviewsWeight = Math.log(
            b.ratings?.count || b.reviewCount || b.reviews?.length || 1
          );

          const aScore = aRatingWeight * 0.7 + aReviewsWeight * 0.3;
          const bScore = bRatingWeight * 0.7 + bReviewsWeight * 0.3;

          return bScore - aScore;
      }
    });
  }, [locations, searchQuery, selectedCategory, selectedSort]);

  const handleCategoryChange = (category: CategoryType | "") => {
    setSelectedCategory(category);
  };

  const handleSortChange = (option: SortOption) => {
    setSelectedSort(option);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Mekanları Keşfet
        </h1>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar />
            </div>
            <div className="w-full sm:w-64">
              <SortSelect selected={selectedSort} onChange={handleSortChange} />
            </div>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onChange={handleCategoryChange}
          />

          <LocationList
            locations={filteredAndSortedLocations}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
