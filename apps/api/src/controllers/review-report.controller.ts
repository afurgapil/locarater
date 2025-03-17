import { Request, Response } from "express";
import { ReviewReportModel } from "../models/review-report.model";
import { Location } from "../models/location.model";
import { User } from "../models/user.model";
import { AuthRequest } from "../types/auth";
import { Types, Document } from "mongoose";

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
  status: "PENDING" | "RESOLVED" | "REJECTED";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewReportObject {
  _id: Types.ObjectId;
  locationId: {
    _id: Types.ObjectId;
    name: string;
  };
  reviewId: string;
  reporter: {
    _id: Types.ObjectId;
    username: string;
    name: string;
  };
  reason: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  notes?: string;
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
  status: "PENDING" | "RESOLVED" | "REJECTED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const createReviewReport = async (req: AuthRequest, res: Response) => {
  try {
    const { locationId, reviewId, reason } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Lütfen giriş yapın" });
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
      createdAt: populatedReport.createdAt.toISOString(),
      updatedAt: populatedReport.updatedAt.toISOString(),
    };

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
            name: report.locationId.name || "Mekan adı bulunamadı",
          },
          review: review
            ? {
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
              }
            : {
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
    const { status } = req.body;

    const report = await ReviewReportModel.findByIdAndUpdate(
      reportId,
      { status },
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
        name: report.locationId.name || "Mekan adı bulunamadı",
      },
      review: review
        ? {
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
          }
        : {
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
    };

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
            name: report.locationId.name || "Mekan adı bulunamadı",
          },
          review: review
            ? {
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
              }
            : {
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
