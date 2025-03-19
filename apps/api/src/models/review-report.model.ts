import { Schema, model } from "mongoose";

export interface ReviewReport {
  locationId: Schema.Types.ObjectId;
  reviewId: string;
  reporter: Schema.Types.ObjectId;
  reason: string;
  category:
    | "SPAM"
    | "INAPPROPRIATE_CONTENT"
    | "FALSE_INFORMATION"
    | "HARASSMENT"
    | "OTHER";
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  result?: "REMOVED" | "WARNING_ISSUED" | "NO_ACTION" | "FALSE_REPORT";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
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
    category: {
      type: String,
      enum: [
        "SPAM",
        "INAPPROPRIATE_CONTENT",
        "FALSE_INFORMATION",
        "HARASSMENT",
        "OTHER",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    result: {
      type: String,
      enum: ["REMOVED", "WARNING_ISSUED", "NO_ACTION", "FALSE_REPORT"],
    },
    notes: String,
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const ReviewReportModel = model<ReviewReport>(
  "ReviewReport",
  reviewReportSchema
);
