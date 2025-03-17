import { api } from "@/lib/axios";
import { Badge, UserBadge } from "@/types/badge";
import { API_ENDPOINTS } from "@/config/api";

export const badgeService = {
  async getUserBadges(): Promise<UserBadge[]> {
    const response = await api.get(API_ENDPOINTS.badges.getUserBadges);
    return response.data;
  },

  async getAllBadges(): Promise<Badge[]> {
    const response = await api.get(API_ENDPOINTS.badges.getAll);
    return response.data;
  },

  async checkAndUpdateBadges(userId: string): Promise<UserBadge[]> {
    const response = await api.post(API_ENDPOINTS.badges.checkAndUpdateBadges, {
      userId,
    });
    return response.data;
  },
};
