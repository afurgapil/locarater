import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (user: User) => void;
  updateVerificationStatus: (isVerified: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
      },
      updateUser: (user) => set({ user }),
      updateVerificationStatus: (isVerified) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, isVerified } });
        }
      },
      logout: () => {
        set({ user: null, token: null, error: null });
        localStorage.removeItem("token");
      },
      isAuthenticated: () => {
        const token = get().token || localStorage.getItem("token");
        return !!token;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
