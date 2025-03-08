import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { User as AuthUser } from "./auth.service";

export interface User extends AuthUser {
  isActive?: boolean;
  lastLogin?: string;
  id?: string;
  _id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    const { data } = await api.get(API_ENDPOINTS.users.getAll, {
      params: filters,
    });
    return data;
  },

  async getUserById(id: string): Promise<User> {
    const { data } = await api.get(API_ENDPOINTS.users.getUserById(id));
    return data;
  },

  async getUserByUsername(username: string): Promise<User> {
    try {
      const { data } = await api.get(
        API_ENDPOINTS.users.getUserByUsername(username)
      );
      return data;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw new Error("Kullanıcı bulunamadı");
    }
  },

  async forceDeleteUser(userId: string): Promise<{ message: string }> {
    const { data } = await api.delete(API_ENDPOINTS.users.forceDelete(userId));
    return data;
  },
};
