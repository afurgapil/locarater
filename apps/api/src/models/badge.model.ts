import mongoose from "mongoose";

export enum BadgeCategory {
  LOCATION = "LOCATION",
  REVIEW = "REVIEW",
  INTERACTION = "INTERACTION",
  QUALITY = "QUALITY",
}

export interface IBadge {
  name: string;
  description: string;
  image: string;
  category: BadgeCategory;
  requiredCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const badgeSchema = new mongoose.Schema<IBadge>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(BadgeCategory),
      required: true,
    },
    requiredCount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Badge = mongoose.model<IBadge>("Badge", badgeSchema);
