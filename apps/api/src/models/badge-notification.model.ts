import mongoose, { Document } from "mongoose";

export interface IBadgeNotification extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  badgeName: string;
  badgeCategory: string;
  badgeImage: string;
  createdAt: Date;
}

const BadgeNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    badgeName: {
      type: String,
      required: true,
    },
    badgeCategory: {
      type: String,
      required: true,
    },
    badgeImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const BadgeNotification = mongoose.model<IBadgeNotification>(
  "BadgeNotification",
  BadgeNotificationSchema
);
