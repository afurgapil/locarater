import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CSRF token için gerekli
});

// Request interceptor - her istekte Authorization header'ını ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request Config:", {
      url: config.url,
      headers: config.headers,
      method: config.method,
    });
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarını yakala
api.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });

    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState();
      authStore.logout(); // Store'dan logout fonksiyonunu çağır

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/login")
      ) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
