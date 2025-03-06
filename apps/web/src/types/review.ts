export interface Review {
  _id: string;
  locationId: string;
  locationName: string;
  user: {
    _id: string;
    name: string;
    username: string;
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
