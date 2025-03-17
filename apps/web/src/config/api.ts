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
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    validateResetToken: (token: string) =>
      `${API_BASE_URL}/auth/reset-password/${token}`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
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
    imageFromReview: (locationId: string) =>
      `${API_BASE_URL}/locations/${locationId}/image-from-review`,
  },
  upload: {
    image: `${API_BASE_URL}/upload/image`,
  },
  users: {
    getAll: `${API_BASE_URL}/users/all`,
    delete: `${API_BASE_URL}/users/account`,
    update: `${API_BASE_URL}/users/profile`,
    getUserByUsername: (username: string) =>
      `${API_BASE_URL}/users/profile/username/${username}`,
    getUserById: (id: string) => `${API_BASE_URL}/users/profile/id/${id}`,
    changePassword: `${API_BASE_URL}/users/change-password`,
    updateRole: `${API_BASE_URL}/users/update-role`,
    forceDelete: (userId: string) =>
      `${API_BASE_URL}/users/force-delete/${userId}`,
    follow: (userId: string) => `${API_BASE_URL}/users/follow/${userId}`,
    unfollow: (userId: string) => `${API_BASE_URL}/users/unfollow/${userId}`,
    following: (userId: string) => `${API_BASE_URL}/users/following/${userId}`,
    followers: (userId: string) => `${API_BASE_URL}/users/followers/${userId}`,
  },
  statistics: {
    dashboard: `${API_BASE_URL}/statistics/dashboard`,
    user: `${API_BASE_URL}/statistics/user`,
    publicProfileStats: (username: string) =>
      `${API_BASE_URL}/statistics/public-profile-stats/${username}`,
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
  reviewReports: {
    create: `${API_BASE_URL}/review-reports`,
    getAll: `${API_BASE_URL}/review-reports`,
    getByUser: `${API_BASE_URL}/review-reports/user`,
    updateStatus: (reportId: string) =>
      `${API_BASE_URL}/review-reports/${reportId}/status`,
    delete: (reportId: string) => `${API_BASE_URL}/review-reports/${reportId}`,
  },
  feed: {
    get: `${API_BASE_URL}/feed`,
    likeReview: (reviewId: string) =>
      `${API_BASE_URL}/feed/reviews/${reviewId}/like`,
    dislikeReview: (reviewId: string) =>
      `${API_BASE_URL}/feed/reviews/${reviewId}/dislike`,
    removeReaction: (reviewId: string) =>
      `${API_BASE_URL}/feed/reviews/${reviewId}/reaction`,
    getComments: (reviewId: string) =>
      `${API_BASE_URL}/feed/reviews/${reviewId}/comments`,
    addComment: (reviewId: string) =>
      `${API_BASE_URL}/feed/reviews/${reviewId}/comments`,
    deleteComment: (reviewId: string, commentId: string) =>
      `${API_BASE_URL}/feed/reviews/${reviewId}/comments/${commentId}`,
  },
  badges: {
    getAll: `${API_BASE_URL}/badges`,
    getUserBadges: `${API_BASE_URL}/badges/user`,
    checkAndUpdateBadges: `${API_BASE_URL}/badges/check`,
  },
};

export type ApiEndpoints = typeof API_ENDPOINTS;
