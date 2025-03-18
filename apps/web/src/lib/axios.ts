import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: string | null) => void;
  reject: (error: Error) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !requestUrl.includes("/auth/refresh-token") &&
      !requestUrl.includes("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Refresh token bulunamadı");
        }

        const response = await authService.refreshToken();
        const { token } = response;

        if (token) {
          if (originalRequest?.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          processQueue(null, token);
          isRefreshing = false;
          return axios(originalRequest);
        } else {
          throw new Error("Yeni token alınamadı");
        }
      } catch (refreshError) {
        console.error("Token yenilenemedi");

        processQueue(
          refreshError instanceof Error
            ? refreshError
            : new Error("Token refresh failed"),
          null
        );

        const authStore = useAuthStore.getState();
        authStore.logout();

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/login")
        ) {
          window.location.href = "/auth/login";
        }

        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
