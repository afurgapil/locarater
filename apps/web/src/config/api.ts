const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    profile: `${API_BASE_URL}/auth/profile`,
  },
  locations: {
    getAll: `${API_BASE_URL}/locations`,
    getById: (id: string) => `${API_BASE_URL}/locations/${id}`,
    getByUser: `${API_BASE_URL}/locations/user`,
    create: `${API_BASE_URL}/locations`,
    update: (id: string) => `${API_BASE_URL}/locations/${id}`,
    delete: (id: string) => `${API_BASE_URL}/locations/${id}`,
    getReviews: (id: string) => `${API_BASE_URL}/locations/${id}/reviews`,
    addReview: (id: string) => `${API_BASE_URL}/locations/${id}/reviews`,
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
    getAll: `${API_BASE_URL}/users`,
    getById: (id: string) => `${API_BASE_URL}/users/${id}`,
    update: (id: string) => `${API_BASE_URL}/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  statistics: {
    dashboard: `${API_BASE_URL}/statistics/dashboard`,
    user: `${API_BASE_URL}/statistics/user`,
  },
  reviews: {
    getAll: `${API_BASE_URL}/reviews`,
    getById: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    create: `${API_BASE_URL}/reviews`,
    update: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    delete: (id: string) => `${API_BASE_URL}/reviews/${id}`,
    getByUser: `${API_BASE_URL}/reviews/user`,
  },
};

export type ApiEndpoints = typeof API_ENDPOINTS;
