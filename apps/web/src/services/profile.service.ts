import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

export interface Profile {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  imageUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  username?: string;
  image?: File;
}

interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  async getProfile(id: string): Promise<Profile> {
    const { data } = await api.get(API_ENDPOINTS.users.getUserById(id));
    return data;
  },

  async updateProfile(updateData: ProfileUpdateData): Promise<Profile> {
    const formData = new FormData();

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });

    const { data } = await api.put(API_ENDPOINTS.users.update, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deleteAccount(password: string): Promise<void> {
    await api.delete(API_ENDPOINTS.users.delete, {
      data: { password },
    });
  },

  async changePassword(passwordData: PasswordUpdateData): Promise<void> {
    await api.post(API_ENDPOINTS.users.changePassword, passwordData);
  },

  getImageUrl(imagePath: string): string {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${imagePath}`;
  },
};
