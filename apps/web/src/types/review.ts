export interface Review {
  _id: string;
  locationId: string;
  locationName: string;
  user: {
    _id: string;
    name: string;
    username: string;
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
