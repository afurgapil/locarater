import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

export type NotificationType =
  | "REPORT_CREATED"
  | "REPORT_RESOLVED"
  | "REPORT_REJECTED"
  | "BADGE_EARNED"
  | "REVIEW_LIKED"
  | "REVIEW_DISLIKED"
  | "REVIEW_COMMENTED"
  | "NEW_FOLLOWER";

interface UserInfo {
  id: string;
  name: string;
  username: string;
  imageUrl?: string;
  followers_count?: number;
  reviews_count?: number;
}

interface NotificationData {
  follower?: UserInfo;
  likedBy?: UserInfo;
  dislikedBy?: UserInfo;
  commentBy?: UserInfo;
  locationId?: string;
  locationName?: string;
  commentId?: string;
  commentContent?: string;
  reviewContent?: string;
  reviewRating?: number;
  reviewId?: string;
  locationImageUrl?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  data?: NotificationData;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  count: number;
  unreadCount: number;
}

class NotificationService {
  async getNotifications(options?: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
  }): Promise<NotificationResponse> {
    const params = new URLSearchParams();

    if (options?.limit) {
      params.append("limit", options.limit.toString());
    }

    if (options?.offset) {
      params.append("offset", options.offset.toString());
    }

    if (options?.isRead !== undefined) {
      params.append("isRead", options.isRead.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";

    const response = await api.get(
      `${API_ENDPOINTS.notifications.getAll}${queryString}`
    );
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.put(
      API_ENDPOINTS.notifications.markAsRead(notificationId)
    );
    return response.data;
  }

  async markAllAsRead(): Promise<{ message: string; modifiedCount: number }> {
    const response = await api.put(API_ENDPOINTS.notifications.markAllAsRead);
    return response.data;
  }

  async deleteNotification(
    notificationId: string
  ): Promise<{ message: string }> {
    const response = await api.delete(
      API_ENDPOINTS.notifications.delete(notificationId)
    );
    return response.data;
  }

  async deleteAllNotifications(): Promise<{
    message: string;
    deletedCount: number;
  }> {
    const response = await api.delete(API_ENDPOINTS.notifications.deleteAll);
    return response.data;
  }
}

export const notificationService = new NotificationService();
