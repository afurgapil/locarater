import mongoose, { Document } from "mongoose";

export enum NotificationType {
  REPORT_CREATED = "REPORT_CREATED",
  REPORT_RESOLVED = "REPORT_RESOLVED",
  REPORT_REJECTED = "REPORT_REJECTED",
  BADGE_EARNED = "BADGE_EARNED",
  REVIEW_LIKED = "REVIEW_LIKED",
  NEW_FOLLOWER = "NEW_FOLLOWER",
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
