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
        formData.append(key, value as string);
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
};
