import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/axios";

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
  status: "PENDING" | "RESOLVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewReportDto {
  locationId: string;
  reviewId: string;
  reason: string;
}

export interface UpdateReviewReportStatusDto {
  status: "RESOLVED" | "REJECTED";
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
    status: UpdateReviewReportStatusDto["status"]
  ) {
    const response = await api.put(
      API_ENDPOINTS.reviewReports.updateStatus(reportId),
      { status }
    );
    return response.data;
  }
}

export const reviewReportService = new ReviewReportService();
