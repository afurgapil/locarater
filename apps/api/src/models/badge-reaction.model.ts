import mongoose, { Document } from "mongoose";

export interface IBadgeReaction extends Document {
  user: mongoose.Types.ObjectId;
  badgeNotification: mongoose.Types.ObjectId;
  type: "like" | "dislike";
  createdAt: Date;
}

const BadgeReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badgeNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BadgeNotification",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

BadgeReactionSchema.index({ user: 1, badgeNotification: 1 }, { unique: true });

export const BadgeReaction = mongoose.model<IBadgeReaction>(
  "BadgeReaction",
  BadgeReactionSchema
);
