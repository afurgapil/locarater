"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { locationService } from "@/services/location.service";
import { ReviewList } from "@/components/review/ReviewList";
import { ReviewForm } from "@/components/review/ReviewForm";
import {
  StarIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { getCategoryLabel, getCategoryImage } from "@/constants/categories";
import Image from "next/image";
import type { Location } from "@/types/location";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.id as string;
  const { user, token } = useAuthStore();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"reviews" | "add-review">(
    "reviews"
  );

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocationById(locationId);
      setLocation(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Mekan bilgileri yüklenirken bir hata oluştu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleReviewSuccess = () => {
    fetchLocation();
    setActiveTab("reviews");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {error || "Mekan bulunamadı"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ratings = {
    taste: location.rating?.taste
      ? Number(location.rating.taste).toFixed(1)
      : "0.0",
    service: location.rating?.service
      ? Number(location.rating.service).toFixed(1)
      : "0.0",
    ambiance: location.rating?.ambiance
      ? Number(location.rating.ambiance).toFixed(1)
      : "0.0",
    pricePerformance: location.rating?.pricePerformance
      ? Number(location.rating.pricePerformance).toFixed(1)
      : "0.0",
  };

  if (!location.rating && location.reviews && location.reviews.length > 0) {
    const reviewsWithRatings = location.reviews.filter(
      (review) => review.rating
    );

    if (reviewsWithRatings.length > 0) {
      const tasteSum = reviewsWithRatings.reduce(
        (sum, review) => sum + (review.rating.taste || 0),
        0
      );
      const serviceSum = reviewsWithRatings.reduce(
        (sum, review) => sum + (review.rating.service || 0),
        0
      );
      const ambianceSum = reviewsWithRatings.reduce(
        (sum, review) => sum + (review.rating.ambiance || 0),
        0
      );
      const pricePerformanceSum = reviewsWithRatings.reduce(
        (sum, review) => sum + (review.rating.pricePerformance || 0),
        0
      );

      const count = reviewsWithRatings.length;

      ratings.taste = (tasteSum / count).toFixed(1);
      ratings.service = (serviceSum / count).toFixed(1);
      ratings.ambiance = (ambianceSum / count).toFixed(1);
      ratings.pricePerformance = (pricePerformanceSum / count).toFixed(1);
    }
  }

  const ratingPercentages = {
    taste:
      Number(ratings.taste) > 0 ? Math.min(Number(ratings.taste) * 10, 100) : 0,
    service:
      Number(ratings.service) > 0
        ? Math.min(Number(ratings.service) * 10, 100)
        : 0,
    ambiance:
      Number(ratings.ambiance) > 0
        ? Math.min(Number(ratings.ambiance) * 10, 100)
        : 0,
    pricePerformance:
      Number(ratings.pricePerformance) > 0
        ? Math.min(Number(ratings.pricePerformance) * 10, 100)
        : 0,
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="relative h-64 sm:h-80 md:h-96">
          <Image
            src={getCategoryImage(location.category)}
            alt={location.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {location.name}
            </h1>
            <div className="flex items-center text-white/90 mb-2">
              <MapPinIcon className="h-5 w-5 mr-1" />
              <span>
                {location.address.city}, {location.address.district}
              </span>
            </div>
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 mr-1 text-white/90" />
              <span className="text-white/90">
                {getCategoryLabel(location.category)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Mekan Bilgileri
            </h2>

            {location.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Açıklama
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {location.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Adres
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {location.address.city}, {location.address.district}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Kategori
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {getCategoryLabel(location.category)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Eklenme Tarihi
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(location.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Ekleyen
                </h3>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {typeof location.createdBy === "object" &&
                    location.createdBy !== null
                      ? location.createdBy.name || location.createdBy.username
                      : "Kullanıcı"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Değerlendirme Özeti
            </h2>

            <div className="flex items-center mb-4">
              <div className="flex items-center mr-2">
                <StarIcon className="h-8 w-8 text-yellow-400" />
                <span className="text-3xl font-bold ml-2 text-gray-900 dark:text-white">
                  {location.ratings?.average?.toFixed(1) ||
                    location.averageRating?.toFixed(1) ||
                    "0.0"}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                (
                {location.ratings?.count ||
                  location.reviewCount ||
                  location.reviews?.length ||
                  0}{" "}
                değerlendirme)
              </span>
            </div>

            {(location.ratings && location.ratings.count > 0) ||
            location.reviewCount > 0 ||
            (location.reviews && location.reviews.length > 0) ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-24">
                    Lezzet
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${ratingPercentages.taste}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ratings.taste}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-24">
                    Servis
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${ratingPercentages.service}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ratings.service}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-24">
                    Ambiyans
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${ratingPercentages.ambiance}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ratings.ambiance}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-24">
                    Fiyat/Perf.
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{
                        width: `${ratingPercentages.pricePerformance}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ratings.pricePerformance}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!
              </p>
            )}

            <button
              onClick={() => setActiveTab("add-review")}
              className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Değerlendirme Yap
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Değerlendirmeler
            </button>
            <button
              onClick={() => setActiveTab("add-review")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "add-review"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Değerlendirme Yap
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "reviews" ? (
            <ReviewList locationId={location._id} />
          ) : user && token ? (
            <ReviewForm
              locationId={location._id}
              onSuccess={handleReviewSuccess}
            />
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Değerlendirme yapmak için giriş yapmalısınız
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Değerlendirme yapabilmek için lütfen hesabınıza giriş yapın veya
                yeni bir hesap oluşturun.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href={`/auth/login?redirect=${encodeURIComponent(`/locations/${locationId}`)}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Giriş Yap
                </Link>
                <Link
                  href={`/auth/register?redirect=${encodeURIComponent(`/locations/${locationId}`)}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
