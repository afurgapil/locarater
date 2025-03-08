import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ResetPasswordCredentials {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UpdatePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileCredentials {
  name?: string;
  avatar?: File;
}

export interface UpdateRoleCredentials {
  identifier: string;
  role: "USER" | "ADMIN" | "BUSINESS_OWNER";
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      credentials
    );
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
    }
  },

  async updateUserRole(
    credentials: UpdateRoleCredentials
  ): Promise<{ message: string; user: User }> {
    const { data } = await api.post(
      API_ENDPOINTS.users.updateRole,
      credentials
    );
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string; user: User }> {
    const { data } = await api.get(API_ENDPOINTS.auth.verifyEmail(token));
    return data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const { data } = await api.post(API_ENDPOINTS.auth.resendVerification, {
      email,
    });
    return data;
  },
};
