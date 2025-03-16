import { useAuthStore } from "@/store/useAuthStore";

export function useUser() {
  const { user, loading, error } = useAuthStore();
  return { user, loading, error };
}
