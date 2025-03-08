"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { locationService } from "@/services/location.service";
import { Location } from "@/types/location";
import { useToast } from "@/hooks/useToast";

export default function AdminEditLocationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    address: {
      city: "",
      district: "",
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        const data = await locationService.getLocationById(id);
        setLocation(data);
        setFormData({
          name: data.name,
          description: data.description || "",
          category: data.category,
          address: {
            city: data.address.city,
            district: data.address.district,
          },
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        setError("Lokasyon bilgileri yüklenirken bir hata oluştu");
        showToast("Lokasyon bilgileri yüklenirken bir hata oluştu", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "city" || name === "district") {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      await locationService.updateLocation(id, formData);
      showToast("Lokasyon başarıyla güncellendi", "success");
      router.push("/admin/locations");
    } catch (error) {
      console.error("Error updating location:", error);
      setError("Lokasyon güncellenirken bir hata oluştu");
      showToast("Lokasyon güncellenirken bir hata oluştu", "error");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Lokasyon Düzenle
        </h1>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Geri Dön
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : location ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mekan Adı
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="RESTAURANT">Restoran</option>
                <option value="CAFE">Kafe</option>
                <option value="FAST_FOOD">Fast Food</option>
                <option value="PATISSERIE">Pastane</option>
                <option value="BAR">Bar</option>
                <option value="CLUB">Kulüp</option>
                <option value="PUB">Pub</option>
                <option value="FINE_DINING">Fine Dining</option>
                <option value="STREET_FOOD">Sokak Lezzeti</option>
                <option value="HOME_MADE">Ev Yapımı</option>
                <option value="OTHER">Diğer</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Şehir
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  İlçe
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.address.district}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Lokasyon bulunamadı
        </div>
      )}
    </div>
  );
}
