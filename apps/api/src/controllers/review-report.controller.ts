import { Request, Response } from "express";
import { ReviewReportModel } from "../models/review-report.model";
import { Location } from "../models/location.model";
import { User } from "../models/user.model";
import { AuthRequest } from "../types/auth";
import { Types, Document } from "mongoose";
import { notificationService } from "../services/notification.service";

interface PopulatedLocation {
  _id: Types.ObjectId;
  name: string;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  username: string;
  name: string;
}

interface ReviewReport extends Document {
  _id: Types.ObjectId;
  locationId: PopulatedLocation;
  reviewId: string;
  reporter: PopulatedUser;
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
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportResponseObject {
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
  category:
    | "SPAM"
    | "INAPPROPRIATE_CONTENT"
    | "FALSE_INFORMATION"
    | "HARASSMENT"
    | "OTHER";
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  result?: "REMOVED" | "WARNING_ISSUED" | "NO_ACTION" | "FALSE_REPORT";
  notes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const createReviewReport = async (req: AuthRequest, res: Response) => {
  try {
    const { locationId, reviewId, reason, category } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    if (!category) {
      return res.status(400).json({ message: "Kategori belirtilmelidir" });
    }

    const location = await Location.findById(locationId).lean();
    if (!location) {
      return res.status(404).json({ message: "Mekan bulunamadı" });
    }

    const review = location.reviews.find((r) => r._id.toString() === reviewId);
    if (!review) {
      return res.status(404).json({ message: "Değerlendirme bulunamadı" });
    }

    const existingReport = await ReviewReportModel.findOne({
      locationId,
      reviewId,
      reporter: req.user._id,
    }).lean();

    if (existingReport) {
      return res
        .status(400)
        .json({ message: "Bu değerlendirmeyi zaten raporladınız" });
    }

    const report = await ReviewReportModel.create({
      locationId,
      reviewId,
      reporter: req.user._id,
      reason,
      category,
    });

    const populatedReport = await ReviewReportModel.findById(report._id)
      .populate<ReviewReport>([
        {
          path: "locationId",
          select: "name",
        },
        {
          path: "reporter",
          select: "_id username name",
        },
      ])
      .lean();

    if (!populatedReport) {
      return res
        .status(500)
        .json({ message: "Rapor oluşturulurken bir hata oluştu" });
    }

    const reviewUser = await User.findById(review.user)
      .select("_id username name")
      .lean();

    const responseObject: ReportResponseObject = {
      ...populatedReport,
      _id: populatedReport._id.toString(),
      locationId: {
        _id: populatedReport.locationId._id.toString(),
        name: populatedReport.locationId.name,
      },
      review: {
        _id: review._id.toString(),
        comment: review.comment || "",
        user: reviewUser
          ? {
              _id: reviewUser._id.toString(),
              username: reviewUser.username,
              name: reviewUser.name,
            }
          : {
              _id: review.user.toString(),
              username: "Kullanıcı bulunamadı",
              name: "Kullanıcı bulunamadı",
            },
      },
      reporter: {
        _id: populatedReport.reporter._id.toString(),
        username: populatedReport.reporter.username,
        name: populatedReport.reporter.name,
      },
      category: populatedReport.category,
      status: populatedReport.status,
      result: populatedReport.result,
      reason: populatedReport.reason,
      notes: populatedReport.notes,
      processedAt: populatedReport.processedAt
        ? populatedReport.processedAt.toISOString()
        : undefined,
      createdAt: populatedReport.createdAt.toISOString(),
      updatedAt: populatedReport.updatedAt.toISOString(),
    };

    if (reviewUser) {
      try {
        await notificationService.sendReportCreatedNotification({
          reviewUserId: reviewUser._id.toString(),
          reportId: populatedReport._id.toString(),
          locationName: populatedReport.locationId.name,
          reporterName:
            populatedReport.reporter.name || populatedReport.reporter.username,
          reportCategory: populatedReport.category,
        });
      } catch (notificationError) {
        console.error("Error sending report notification:", notificationError);
        // Bildirim gönderme hatası olsa bile ana işlemi devam ettiriyoruz
      }
    }

    res.status(201).json(responseObject);
  } catch (error) {
    console.error("Error creating review report:", error);
    res.status(500).json({ message: "Rapor oluşturulurken bir hata oluştu" });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await ReviewReportModel.find()
      .sort({ createdAt: -1 })
      .populate<ReviewReport>([
        {
          path: "locationId",
          select: "name",
        },
        {
          path: "reporter",
          select: "_id username name",
        },
      ])
      .lean();

    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        if (!report.locationId || !report.locationId._id) {
          return {
            ...report,
            _id: report._id.toString(),
            locationId: {
              _id: "",
              name: "Mekan bulunamadı",
            },
            review: {
              _id: "",
              comment: "Değerlendirme bulunamadı",
              user: {
                _id: "",
                username: "",
                name: "",
              },
            },
            reporter: {
              _id: report.reporter._id.toString(),
              username: report.reporter.username,
              name: report.reporter.name,
            },
            createdAt: report.createdAt.toISOString(),
            updatedAt: report.updatedAt.toISOString(),
          } as ReportResponseObject;
        }

        const location = await Location.findById(report.locationId._id).lean();
        const review = location?.reviews.find(
          (r) => r._id.toString() === report.reviewId
        );

        let reviewUser = null;
        if (review) {
          reviewUser = await User.findById(review.user)
            .select("_id username name")
            .lean();
        }

        const responseObject: ReportResponseObject = {
          ...report,
          _id: report._id.toString(),
          locationId: {
            _id: report.locationId._id.toString(),
            name: report.locationId.name,
          },
          review: {
            _id: review ? review._id.toString() : "",
            comment: review ? review.comment || "" : "Değerlendirme bulunamadı",
            user: reviewUser
              ? {
                  _id: reviewUser._id.toString(),
                  username: reviewUser.username,
                  name: reviewUser.name,
                }
              : {
                  _id: review ? review.user.toString() : "",
                  username: "Kullanıcı bulunamadı",
                  name: "Kullanıcı bulunamadı",
                },
          },
          reporter: {
            _id: report.reporter._id.toString(),
            username: report.reporter.username,
            name: report.reporter.name,
          },
          category: report.category,
          status: report.status,
          result: report.result,
          reason: report.reason,
          notes: report.notes,
          processedAt: report.processedAt
            ? report.processedAt.toISOString()
            : undefined,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString(),
        };

        return responseObject;
      })
    );

    res.json(populatedReports);
  } catch (error) {
    console.error("Error fetching review reports:", error);
    res.status(500).json({ message: "Raporlar yüklenirken bir hata oluştu" });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { status, result, notes } = req.body;

    const updateData: {
      status: string;
      result?: string;
      notes?: string;
      processedAt?: Date;
    } = { status };

    if (result) updateData.result = result;
    if (notes) updateData.notes = notes;

    if (status === "RESOLVED" || status === "REJECTED") {
      updateData.processedAt = new Date();
    }

    const report = await ReviewReportModel.findByIdAndUpdate(
      reportId,
      updateData,
      { new: true }
    )
      .populate<ReviewReport>([
        {
          path: "locationId",
          select: "name",
        },
        {
          path: "reporter",
          select: "_id username name",
        },
      ])
      .lean();

    if (!report) {
      return res.status(404).json({ message: "Rapor bulunamadı" });
    }

    if (!report.locationId || !report.locationId._id) {
      const responseObject: ReportResponseObject = {
        ...report,
        _id: report._id.toString(),
        locationId: {
          _id: "",
          name: "Mekan bulunamadı",
        },
        review: {
          _id: "",
          comment: "Değerlendirme bulunamadı",
          user: {
            _id: "",
            username: "",
            name: "",
          },
        },
        reporter: {
          _id: report.reporter._id.toString(),
          username: report.reporter.username,
          name: report.reporter.name,
        },
        category: report.category,
        status: report.status,
        result: report.result,
        reason: report.reason,
        notes: report.notes,
        processedAt: report.processedAt
          ? report.processedAt.toISOString()
          : undefined,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      };

      return res.json(responseObject);
    }

    const location = await Location.findById(report.locationId._id).lean();
    const review = location?.reviews.find(
      (r) => r._id.toString() === report.reviewId
    );

    let reviewUser = null;
    if (review) {
      reviewUser = await User.findById(review.user)
        .select("_id username name")
        .lean();
    }

    const responseObject: ReportResponseObject = {
      ...report,
      _id: report._id.toString(),
      locationId: {
        _id: report.locationId._id.toString(),
        name: report.locationId.name,
      },
      review: {
        _id: review ? review._id.toString() : "",
        comment: review ? review.comment || "" : "Değerlendirme bulunamadı",
        user: reviewUser
          ? {
              _id: reviewUser._id.toString(),
              username: reviewUser.username,
              name: reviewUser.name,
            }
          : {
              _id: review ? review.user.toString() : "",
              username: "Kullanıcı bulunamadı",
              name: "Kullanıcı bulunamadı",
            },
      },
      reporter: {
        _id: report.reporter._id.toString(),
        username: report.reporter.username,
        name: report.reporter.name,
      },
      category: report.category,
      status: report.status,
      result: report.result,
      reason: report.reason,
      notes: report.notes,
      processedAt: report.processedAt
        ? report.processedAt.toISOString()
        : undefined,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };

    try {
      if (status === "RESOLVED") {
        await notificationService.sendReportResolvedNotification({
          reporterId: report.reporter._id,
          reportId: report._id.toString(),
          locationName: report.locationId.name,
          result: report.result,
          notes: report.notes,
        });
      } else if (status === "REJECTED") {
        await notificationService.sendReportRejectedNotification({
          reporterId: report.reporter._id,
          reportId: report._id.toString(),
          locationName: report.locationId.name,
          notes: report.notes,
        });
      }
    } catch (notificationError) {
      console.error(
        "Error sending report status notification:",
        notificationError
      );
    }

    res.json(responseObject);
  } catch (error) {
    console.error("Error updating review report status:", error);
    res
      .status(500)
      .json({ message: "Rapor durumu güncellenirken bir hata oluştu" });
  }
};

export const getUserReports = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
    }

    const reports = await ReviewReportModel.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .populate<ReviewReport>([
        {
          path: "locationId",
          select: "name",
        },
        {
          path: "reporter",
          select: "_id username name",
        },
      ])
      .lean();

    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        if (!report.locationId || !report.locationId._id) {
          return {
            ...report,
            _id: report._id.toString(),
            locationId: {
              _id: "",
              name: "Mekan bulunamadı",
            },
            review: {
              _id: "",
              comment: "Değerlendirme bulunamadı",
              user: {
                _id: "",
                username: "",
                name: "",
              },
            },
            reporter: {
              _id: report.reporter._id.toString(),
              username: report.reporter.username,
              name: report.reporter.name,
            },
            processedAt: report.processedAt
              ? report.processedAt.toISOString()
              : undefined,
            createdAt: report.createdAt.toISOString(),
            updatedAt: report.updatedAt.toISOString(),
          } as ReportResponseObject;
        }

        const location = await Location.findById(report.locationId._id).lean();
        const review = location?.reviews.find(
          (r) => r._id.toString() === report.reviewId
        );

        let reviewUser = null;
        if (review) {
          reviewUser = await User.findById(review.user)
            .select("_id username name")
            .lean();
        }

        const responseObject: ReportResponseObject = {
          ...report,
          _id: report._id.toString(),
          locationId: {
            _id: report.locationId._id.toString(),
            name: report.locationId.name,
          },
          review: {
            _id: review ? review._id.toString() : "",
            comment: review ? review.comment || "" : "Değerlendirme bulunamadı",
            user: reviewUser
              ? {
                  _id: reviewUser._id.toString(),
                  username: reviewUser.username,
                  name: reviewUser.name,
                }
              : {
                  _id: review ? review.user.toString() : "",
                  username: "Kullanıcı bulunamadı",
                  name: "Kullanıcı bulunamadı",
                },
          },
          reporter: {
            _id: report.reporter._id.toString(),
            username: report.reporter.username,
            name: report.reporter.name,
          },
          category: report.category,
          status: report.status,
          result: report.result,
          reason: report.reason,
          notes: report.notes,
          processedAt: report.processedAt
            ? report.processedAt.toISOString()
            : undefined,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString(),
        };

        return responseObject;
      })
    );

    res.json(populatedReports);
  } catch (error) {
    console.error("Error fetching user review reports:", error);
    res.status(500).json({ message: "Raporlar yüklenirken bir hata oluştu" });
  }
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await ReviewReportModel.findById(reportId).lean();

    if (!report) {
      return res.status(404).json({ message: "Rapor bulunamadı" });
    }

    await ReviewReportModel.findByIdAndDelete(reportId);

    res.status(200).json({ message: "Rapor başarıyla silindi" });
  } catch (error) {
    console.error("Error deleting review report:", error);

    if (error instanceof Error) {
      res.status(500).json({
        message: `Rapor silinirken bir hata oluştu: ${error.message}`,
      });
    } else {
      res.status(500).json({ message: "Rapor silinirken bir hata oluştu" });
    }
  }
};
