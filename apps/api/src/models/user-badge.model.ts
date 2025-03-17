import mongoose from "mongoose";

export interface IUserBadge {
  userId: string;
  badgeId: mongoose.Types.ObjectId;
  unlockedAt: Date | null;
  progress: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userBadgeSchema = new mongoose.Schema<IUserBadge>(
  {
    userId: { type: String, required: true },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    unlockedAt: { type: Date, default: null },
    progress: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = mongoose.model<IUserBadge>(
  "UserBadge",
  userBadgeSchema
);
