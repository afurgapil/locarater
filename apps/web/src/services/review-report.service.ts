import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

export type ReportCategory =
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "FALSE_INFORMATION"
  | "HARASSMENT"
  | "OTHER";
export type ReportStatus = "PENDING" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
export type ReportResult =
  | "REMOVED"
  | "WARNING_ISSUED"
  | "NO_ACTION"
  | "FALSE_REPORT";

export interface ReviewReport {
  _id: string;
  locationId: {
    _id: string;
    name: string;
  };
  reviewId: string;
  review: {
    _id: string;
    comment: string;
    user: {
      _id: string;
      username: string;
      name: string;
    };
  };
  reporter: {
    _id: string;
    username: string;
    name: string;
  };
  reason: string;
  category: ReportCategory;
  status: ReportStatus;
  result?: ReportResult;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface CreateReviewReportDto {
  locationId: string;
  reviewId: string;
  reason: string;
  category: ReportCategory;
}

export interface UpdateReviewReportStatusDto {
  status: ReportStatus;
  result?: ReportResult;
  notes?: string;
}

class ReviewReportService {
  async createReport(data: CreateReviewReportDto) {
    const response = await api.post(API_ENDPOINTS.reviewReports.create, data);
    return response.data;
  }

  async getAllReports(): Promise<ReviewReport[]> {
    const response = await api.get(API_ENDPOINTS.reviewReports.getAll);
    return response.data;
  }

  async getUserReports(): Promise<ReviewReport[]> {
    const response = await api.get(API_ENDPOINTS.reviewReports.getByUser);
    return response.data;
  }

  async updateReportStatus(
    reportId: string,
    data: UpdateReviewReportStatusDto
  ) {
    const response = await api.put(
      API_ENDPOINTS.reviewReports.updateStatus(reportId),
      data
    );
    return response.data;
  }

  async deleteReport(reportId: string) {
    const response = await api.delete(
      API_ENDPOINTS.reviewReports.delete(reportId)
    );
    return response.data;
  }
}

export const reviewReportService = new ReviewReportService();
