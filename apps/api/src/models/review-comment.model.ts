import mongoose, { Document, Schema } from "mongoose";

export interface IReviewComment extends Document {
  user: mongoose.Types.ObjectId;
  review: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewCommentSchema = new Schema(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const ReviewComment = mongoose.model<IReviewComment>(
  "ReviewComment",
  reviewCommentSchema
);
