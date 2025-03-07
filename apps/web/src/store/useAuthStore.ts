import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: {
    _id?: string;
    username: string;
    role: string;
  } | null;
  token: string | null;
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
      },
      logout: () => {
        set({ user: null, token: null });
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
