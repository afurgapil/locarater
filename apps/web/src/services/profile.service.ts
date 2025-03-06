import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatar?: File;
  currentPassword?: string;
  newPassword?: string;
}

interface Profile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export const profileService = {
  async getProfile(): Promise<Profile> {
    const { data } = await api.get(API_ENDPOINTS.user.profile);
    return data;
  },

  async updateProfile(updateData: ProfileUpdateData): Promise<Profile> {
    const formData = new FormData();

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === "avatar" && value instanceof File) {
          formData.append("avatar", value);
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const { data } = await api.put(API_ENDPOINTS.user.update, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete(API_ENDPOINTS.user.delete);
  },
};
