import { CategoryType } from "@/constants/categories";

export interface Location {
  _id: string;
  name: string;
  category: CategoryType;
  description?: string;
  address: {
    city: string;
    district: string;
  };
  rating?: {
    overall: number;
    taste: number;
    service: number;
    ambiance: number;
    pricePerformance: number;
  };
  ratings?: {
    average: number;
    count: number;
    distribution: {
      10: number;
      9: number;
      8: number;
      7: number;
      6: number;
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
  createdBy: {
    _id: string;
    username: string;
    name: string;
    imageUrl?: string;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  id?: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    name: string;
    imageUrl?: string;
  };
  rating: {
    overall: number;
    taste: number;
    service: number;
    ambiance: number;
    pricePerformance: number;
  };
  comment: string;
  imageUrl?: string;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
}
