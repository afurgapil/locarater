import mongoose, { Document } from "mongoose";

export interface IBadgeComment extends Document {
  user: mongoose.Types.ObjectId;
  badgeNotification: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const BadgeCommentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const BadgeComment = mongoose.model<IBadgeComment>(
  "BadgeComment",
  BadgeCommentSchema
);
