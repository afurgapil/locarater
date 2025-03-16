import { User } from "./auth.service";
import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface UserResponse {
  user: User;
  message?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  async getUserById(id: string): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.users.getUserById(id));
    return data;
  },

  async getUserByUsername(username: string): Promise<User> {
    const { data } = await api.get<User>(
      API_ENDPOINTS.users.getUserByUsername(username)
    );
    return data;
  },

  async updateUserRole(
    identifier: string,
    role: string
  ): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>(
      API_ENDPOINTS.users.updateRole,
      {
        identifier,
        role,
      }
    );
    return data;
  },

  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>(API_ENDPOINTS.users.getAll);
    return data;
  },

  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    const { data } = await api.get(API_ENDPOINTS.users.getAll, {
      params: filters,
    });
    return data;
  },

  async forceDeleteUser(userId: string): Promise<{ message: string }> {
    const { data } = await api.delete(API_ENDPOINTS.users.forceDelete(userId));
    return data;
  },

  async getUserProfile(userId: string): Promise<UserResponse> {
    const { data } = await api.get<UserResponse>(
      API_ENDPOINTS.users.getUserById(userId)
    );
    return data;
  },

  async updateUserProfile(profile: Partial<User>): Promise<UserResponse> {
    const { data } = await api.put<UserResponse>(
      API_ENDPOINTS.users.update,
      profile
    );
    return data;
  },

  async changePassword(newPassword: string): Promise<UserResponse> {
    const { data } = await api.put<UserResponse>(
      API_ENDPOINTS.users.changePassword,
      { newPassword }
    );
    return data;
  },

  async deleteAccount(): Promise<UserResponse> {
    const { data } = await api.delete<UserResponse>(API_ENDPOINTS.users.delete);
    return data;
  },

  async followUser(userId: string): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>(
      API_ENDPOINTS.users.follow(userId)
    );
    return data;
  },

  async unfollowUser(userId: string): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>(
      API_ENDPOINTS.users.unfollow(userId)
    );
    return data;
  },

  async getFollowing(userId: string): Promise<{ following: User[] }> {
    const { data } = await api.get<{ following: User[] }>(
      API_ENDPOINTS.users.following(userId)
    );
    return data;
  },

  async getFollowers(userId: string): Promise<{ followers: User[] }> {
    const { data } = await api.get<{ followers: User[] }>(
      API_ENDPOINTS.users.followers(userId)
    );
    return data;
  },
};

export type { User };
