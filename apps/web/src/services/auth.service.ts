import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  imageUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  followers: string[];
  following: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
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

export interface RefreshTokenRequest {
  refreshToken: string;
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
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      credentials
    );
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    return data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error("Refresh token bulunamadı");
      throw new Error("Refresh token bulunamadı");
    }

    try {
      const { data } = await api.post<AuthResponse>(
        API_ENDPOINTS.auth.refreshToken,
        { refreshToken }
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (error) {
      console.error("Refresh token hatası:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post(API_ENDPOINTS.auth.logout, { refreshToken });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
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

  async forgotPassword(
    credentials: ForgotPasswordCredentials
  ): Promise<{ message: string }> {
    const { data } = await api.post(
      API_ENDPOINTS.auth.forgotPassword,
      credentials
    );
    return data;
  },

  async validateResetToken(
    token: string
  ): Promise<{ message: string; userId: string }> {
    const { data } = await api.get(
      API_ENDPOINTS.auth.validateResetToken(token)
    );
    return data;
  },

  async resetPassword(
    credentials: ResetPasswordCredentials
  ): Promise<{ message: string }> {
    const { data } = await api.post(
      API_ENDPOINTS.auth.resetPassword,
      credentials
    );
    return data;
  },
};
