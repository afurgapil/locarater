import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";
import type { Location } from "@/types/location";

interface CreateLocationDto {
  name: string;
  category: string;
  description?: string;
  address: {
    city: string;
    district: string;
  };
  images?: File[];
}

interface UpdateLocationDto {
  name?: string;
  category?: string;
  address?: {
    city: string;
    district: string;
  };
  images?: File[];
  description?: string;
}

interface LocationSearchParams {
  search?: string;
  categories?: string[];
  near?: {
    latitude: number;
    longitude: number;
    distance: number;
  };
  page?: number;
  limit?: number;
}

export const locationService = {
  async getLocations(): Promise<Location[]> {
    const response = await api.get(API_ENDPOINTS.locations.getAll);
    return response.data;
  },

  async getLocationById(id: string): Promise<Location> {
    const response = await api.get(API_ENDPOINTS.locations.getById(id));
    return response.data;
  },

  async createLocation(data: CreateLocationDto): Promise<Location> {
    let imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      data.images.forEach((image) => {
        formData.append("images", image);
      });
      const uploadResponse = await api.post(
        API_ENDPOINTS.upload.image,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      imageUrls = uploadResponse.data.urls;
    }

    const locationData = {
      ...data,
      images: imageUrls,
    };

    const response = await api.post(
      API_ENDPOINTS.locations.create,
      locationData
    );
    return response.data;
  },

  async updateLocation(id: string, data: UpdateLocationDto): Promise<Location> {
    let imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      data.images.forEach((image) => {
        formData.append("images", image);
      });
      const uploadResponse = await api.post(
        API_ENDPOINTS.upload.image,
        formData
      );
      imageUrls = uploadResponse.data.urls;
    }

    const response = await api.put(API_ENDPOINTS.locations.update(id), {
      ...data,
      ...(imageUrls.length > 0 && { images: imageUrls }),
    });
    return response.data;
  },

  async deleteLocation(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.locations.delete(id));
  },

  async rateLocation(id: string, rating: number): Promise<Location> {
    const { data } = await api.post<Location>(
      API_ENDPOINTS.locations.rate(id),
      {
        rating,
      }
    );
    return data;
  },

  async searchLocations(params: LocationSearchParams): Promise<Location[]> {
    const { data } = await api.get<Location[]>(API_ENDPOINTS.locations.search, {
      params,
    });
    return data;
  },

  async getNearbyLocations(
    latitude: number,
    longitude: number,
    distance: number = 5000
  ): Promise<Location[]> {
    const { data } = await api.get<Location[]>(API_ENDPOINTS.locations.nearby, {
      params: { latitude, longitude, distance },
    });
    return data;
  },

  async getFeaturedLocations(): Promise<Location[]> {
    const { data } = await api.get<Location[]>(
      API_ENDPOINTS.locations.featured
    );
    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data } = await api.get<string[]>(
      API_ENDPOINTS.locations.categories
    );
    return data;
  },

  async getPaginatedLocations(params: LocationSearchParams): Promise<{
    data: Location[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { data } = await api.get(API_ENDPOINTS.locations.getAll, {
      params,
    });
    return data;
  },

  async getUserLocations(): Promise<Location[]> {
    const { data } = await api.get(API_ENDPOINTS.locations.getByUser);
    return data;
  },
};
