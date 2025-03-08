import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { User as AuthUser } from "./auth.service";

export interface User extends AuthUser {
  isActive?: boolean;
  lastLogin?: string;
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
    const { data } = await api.get(`${API_ENDPOINTS.users.profile}/${id}`);
    return data;
  },

  async forceDeleteUser(userId: string): Promise<{ message: string }> {
    const { data } = await api.delete(
      `${API_ENDPOINTS.users.forceDelete(userId)}`
    );
    return data;
  },
};
