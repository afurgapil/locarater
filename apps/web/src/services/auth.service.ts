import { api } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
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
    await api.post(API_ENDPOINTS.auth.logout);
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.auth.profile);
    return data;
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post(API_ENDPOINTS.auth.verifyEmail, { token });
  },

  async forgotPassword(credentials: ForgotPasswordCredentials): Promise<void> {
    await api.post(API_ENDPOINTS.auth.forgotPassword, credentials);
  },

  async resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
    await api.post(API_ENDPOINTS.auth.resetPassword, credentials);
  },

  async updatePassword(credentials: UpdatePasswordCredentials): Promise<void> {
    await api.put(API_ENDPOINTS.users.updatePassword, credentials);
  },

  async updateProfile(credentials: UpdateProfileCredentials): Promise<User> {
    const formData = new FormData();
    if (credentials.name) formData.append("name", credentials.name);
    if (credentials.avatar) formData.append("avatar", credentials.avatar);

    const { data } = await api.put<User>(
      API_ENDPOINTS.users.updateProfile,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete(API_ENDPOINTS.users.deleteAccount);
  },
};
