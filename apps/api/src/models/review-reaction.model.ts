import mongoose, { Document, Schema } from "mongoose";

export interface IReviewReaction extends Document {
  user: mongoose.Types.ObjectId;
  review: mongoose.Types.ObjectId;
  type: "like" | "dislike";
  createdAt: Date;
  updatedAt: Date;
}

const reviewReactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review: {
      type: Schema.Types.ObjectId,
      ref: "Review",
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

reviewReactionSchema.index({ user: 1, review: 1 }, { unique: true });

export const ReviewReaction = mongoose.model<IReviewReaction>(
  "ReviewReaction",
  reviewReactionSchema
);
