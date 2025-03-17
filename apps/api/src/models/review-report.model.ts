import { Schema, model } from "mongoose";

export interface ReviewReport {
  locationId: Schema.Types.ObjectId;
  reviewId: string;
  reporter: Schema.Types.ObjectId;
  reason: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewReportSchema = new Schema<ReviewReport>(
  {
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    reviewId: {
      type: String,
      required: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export const ReviewReportModel = model<ReviewReport>(
  "ReviewReport",
  reviewReportSchema
);
