export interface Location {
  _id: string;
  name: string;
  category: string;
  address: {
    city: string;
    district: string;
  };
  rating?: number;
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
  createdBy: {
    _id: string;
    username: string;
    name: string;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    name: string;
  };
  rating: {
    overall: number;
    taste: number;
    service: number;
    ambiance: number;
    pricePerformance: number;
  };
  comment: string;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
}
