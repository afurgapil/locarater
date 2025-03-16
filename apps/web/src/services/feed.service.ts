import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

export interface LocationFeedData {
  location: {
    _id: string;
    name: string;
    category: string;
    address: string;
    imageUrl?: string;
  };
  creator: {
    _id: string;
    name: string;
    username: string;
    imageUrl?: string;
  };
}

export interface ReviewFeedData {
  review: {
    _id: string;
    rating: {
      overall: number;
      food?: number;
      service?: number;
      ambiance?: number;
      price?: number;
    };
    comment?: string;
    createdAt: string;
    likes: number;
    dislikes: number;
    userReaction: "like" | "dislike" | null;
  };
  reviewer: {
    _id: string;
    name: string;
    username: string;
    imageUrl?: string;
  };
  location: {
    _id: string;
    name: string;
    category: string;
    address: string;
    imageUrl?: string;
  };
}

export interface FeedItem {
  _id?: string;
  type: "LOCATION" | "REVIEW" | "location" | "review";
  createdAt: string;
  data: LocationFeedData | ReviewFeedData;
}

export interface FeedComment {
  _id: string;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    username: string;
    imageUrl?: string;
  };
}

export interface FeedResponse {
  feed: FeedItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const feedService = {
  async getFeed(page = 1, limit = 10): Promise<FeedResponse> {
    const { data } = await api.get<FeedResponse>(API_ENDPOINTS.feed.get, {
      params: { page, limit },
    });
    return data;
  },

  async likeReview(reviewId: string): Promise<void> {
    await api.post(API_ENDPOINTS.feed.likeReview(reviewId));
  },

  async dislikeReview(reviewId: string): Promise<void> {
    await api.post(API_ENDPOINTS.feed.dislikeReview(reviewId));
  },

  async removeReaction(reviewId: string): Promise<void> {
    await api.delete(API_ENDPOINTS.feed.removeReaction(reviewId));
  },

  async getReviewComments(reviewId: string): Promise<FeedComment[]> {
    const { data } = await api.get<FeedComment[]>(
      API_ENDPOINTS.feed.getComments(reviewId)
    );
    return data;
  },

  async addComment(reviewId: string, content: string): Promise<FeedComment> {
    const { data } = await api.post<FeedComment>(
      API_ENDPOINTS.feed.addComment(reviewId),
      { content }
    );
    return data;
  },

  async deleteComment(reviewId: string, commentId: string): Promise<void> {
    await api.delete(API_ENDPOINTS.feed.deleteComment(reviewId, commentId));
  },
};
