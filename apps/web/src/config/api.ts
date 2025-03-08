import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    verifyEmail: (token: string) =>
      `${API_BASE_URL}/auth/verify-email/${token}`,
    resendVerification: `${API_BASE_URL}/auth/resend-verification`,
  },
  locations: {
    getAll: `${API_BASE_URL}/locations`,
    getById: (id: string) => `${API_BASE_URL}/locations/${id}`,
    getByUser: `${API_BASE_URL}/locations/user`,
    create: `${API_BASE_URL}/locations`,
    update: (id: string) => `${API_BASE_URL}/locations/${id}`,
    delete: (id: string) => `${API_BASE_URL}/locations/${id}`,
    search: `${API_BASE_URL}/locations/search`,
    nearby: `${API_BASE_URL}/locations/nearby`,
    featured: `${API_BASE_URL}/locations/featured`,
    categories: `${API_BASE_URL}/locations/categories`,
    rate: (id: string) => `${API_BASE_URL}/locations/${id}/rate`,
  },
  upload: {
    image: `${API_BASE_URL}/upload/image`,
  },
  users: {
    getAll: `${API_BASE_URL}/users/all`,
    profile: `${API_BASE_URL}/users/profile`,
    delete: `${API_BASE_URL}/users/account`,
    update: `${API_BASE_URL}/users/profile`,
    changePassword: `${API_BASE_URL}/users/change-password`,
    updateRole: `${API_BASE_URL}/users/update-role`,
    forceDelete: (userId: string) =>
      `${API_BASE_URL}/users/force-delete/${userId}`,
  },
  statistics: {
    dashboard: `${API_BASE_URL}/statistics/dashboard`,
    user: `${API_BASE_URL}/statistics/user`,
  },
  reviews: {
    getAll: `${API_BASE_URL}/reviews`,
    getById: (locationId: string) => `${API_BASE_URL}/reviews/${locationId}`,
    create: (locationId: string) => `${API_BASE_URL}/reviews/${locationId}`,
    update: (locationId: string, reviewId: string) =>
      `${API_BASE_URL}/reviews/${locationId}/${reviewId}`,
    delete: (locationId: string, reviewId: string) =>
      `${API_BASE_URL}/reviews/${locationId}/${reviewId}`,
    getByUser: `${API_BASE_URL}/reviews/user`,
  },
};

export type ApiEndpoints = typeof API_ENDPOINTS;
