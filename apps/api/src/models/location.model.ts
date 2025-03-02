import mongoose, { Document } from "mongoose";

const AddressSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  coordinates: {
    type: [Number],
    required: false,
    default: null,
  },
});

const PriceRangeSchema = new mongoose.Schema({
  currency: {
    type: String,
    default: "TRY",
  },
  minPrice: Number,
  maxPrice: Number,
  priceCategory: {
    type: String,
    enum: ["₺", "₺₺", "₺₺₺", "₺₺₺₺"],
    default: "₺₺",
  },
});

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    taste: {
      type: Number,
      min: 0,
      max: 10,
    },
    service: {
      type: Number,
      min: 0,
      max: 10,
    },
    ambiance: {
      type: Number,
      min: 0,
      max: 10,
    },
    pricePerformance: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  visitDate: Date,
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    maxLength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "RESTAURANT",
      "CAFE",
      "BAR",
      "CLUB",
      "PATISSERIE",
      "FAST_FOOD",
      "FINE_DINING",
      "BISTRO",
      "PUB",
      "FOOD_TRUCK",
      "OTHER",
    ],
    index: true,
  },
  cuisine: [String],
  specialties: [String],
  address: AddressSchema,
  priceRange: PriceRangeSchema,
  reviews: [ReviewSchema],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    count: {
      type: Number,
      default: 0,
    },
    distribution: {
      10: { type: Number, default: 0 },
      9: { type: Number, default: 0 },
      8: { type: Number, default: 0 },
      7: { type: Number, default: 0 },
      6: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
  },
  tags: [String],
  status: {
    type: String,
    enum: ["ACTIVE", "CLOSED_PERMANENTLY"],
    default: "ACTIVE",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

LocationSchema.index({ "address.city": 1, "address.district": 1 });
LocationSchema.index({ name: "text", description: "text" });
LocationSchema.index({ category: 1 });
LocationSchema.index({ "ratings.average": -1 });
LocationSchema.index({ tags: 1 });

LocationSchema.virtual("reviewCount").get(function () {
  return this.reviews.length;
});

LocationSchema.pre("save", function (next) {
  if (this.reviews?.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => {
      return sum + (review.rating?.overall || 0);
    }, 0);

    if (this.ratings) {
      this.ratings.average = totalRating / this.reviews.length;
      this.ratings.count = this.reviews.length;

      const distribution = {
        10: 0,
        9: 0,
        8: 0,
        7: 0,
        6: 0,
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      this.reviews.forEach((review) => {
        if (review.rating?.overall) {
          const rating = Math.round(review.rating.overall);
          if (rating >= 1 && rating <= 10) {
            distribution[rating as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10]++;
          }
        }
      });
      this.ratings.distribution = distribution;
    }
  }
  next();
});

export interface ILocation extends Document {
  name: string;
  description?: string;
  category: string;
  cuisine: string[];
  specialties: string[];
  address: {
    city: string;
    district: string;
    coordinates: number[];
  };
  priceRange?: {
    currency: string;
    minPrice?: number;
    maxPrice?: number;
    priceCategory: "₺" | "₺₺" | "₺₺₺" | "₺₺₺₺";
  };
  reviews: Array<{
    user: mongoose.Schema.Types.ObjectId;
    rating: {
      overall: number;
      taste?: number;
      service?: number;
      ambiance?: number;
      pricePerformance?: number;
    };
    visitDate?: Date;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  ratings: {
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
  tags: string[];
  status: "ACTIVE" | "CLOSED_PERMANENTLY";
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const Location = mongoose.model<ILocation>("Location", LocationSchema);
