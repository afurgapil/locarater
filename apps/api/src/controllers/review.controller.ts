import { Request, Response } from "express";
import { Location } from "../models/location.model";
import { Types } from "mongoose";

interface Rating {
  overall: number;
  taste?: number;
  service?: number;
  ambiance?: number;
  pricePerformance?: number;
}

interface Review {
  _id: Types.ObjectId;
  user:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        username: string;
        name: string;
      };
  rating: Rating;
  comment?: string;
  visitDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    role: string;
  };
}

export const addReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const locationId = req.params.locationId;
    const reviewData = req.body;
    reviewData.user = req.user?._id;
    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    const existingReview = location.reviews.find(
      (review) => review.user.toString() === req.user?._id
    );

    if (existingReview) {
      res
        .status(400)
        .json({ message: "Bu mekan için zaten bir değerlendirmeniz var" });
      return;
    }

    location.reviews.push({
      user: reviewData.user,
      rating: {
        overall: reviewData.rating.overall,
        taste: reviewData.rating.taste,
        service: reviewData.rating.service,
        ambiance: reviewData.rating.ambiance,
        pricePerformance: reviewData.rating.pricePerformance,
      },
      comment: reviewData.comment,
      visitDate: reviewData.visitDate
        ? new Date(reviewData.visitDate)
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await location.save();

    const updatedLocation = await Location.findById(locationId).populate(
      "reviews.user",
      "username name"
    );

    res.status(201).json({
      message: "Değerlendirme başarıyla eklendi",
      review: updatedLocation?.reviews[updatedLocation.reviews.length - 1],
      ratings: updatedLocation?.ratings,
    });
  } catch (error: any) {
    console.error("Review eklenirken hata:", error);
    res
      .status(500)
      .json({ message: "Review eklenirken hata oluştu", error: error.message });
  }
};

export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { locationId, reviewId } = req.params;
    const reviewData = req.body;

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    const review = (location.reviews as any).id(reviewId) as Review;
    if (!review) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    if (
      review.user.toString() !== req.user?._id &&
      req.user?.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    review.rating = {
      overall: reviewData.rating.overall,
      taste: reviewData.rating.taste,
      service: reviewData.rating.service,
      ambiance: reviewData.rating.ambiance,
      pricePerformance: reviewData.rating.pricePerformance,
    };
    review.comment = reviewData.comment;
    review.visitDate = reviewData.visitDate
      ? new Date(reviewData.visitDate)
      : review.visitDate;
    review.updatedAt = new Date();

    await location.save();

    const updatedLocation = await Location.findById(locationId).populate(
      "reviews.user",
      "username name"
    );

    res.json({
      message: "Değerlendirme başarıyla güncellendi",
      review: updatedLocation?.reviews.id(reviewId),
      ratings: updatedLocation?.ratings,
    });
  } catch (error: any) {
    console.error("Review güncellenirken hata:", error);
    res.status(500).json({
      message: "Review güncellenirken hata oluştu",
      error: error.message,
    });
  }
};

export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { locationId, reviewId } = req.params;

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    const review = (location.reviews as any).id(reviewId) as Review;
    if (!review) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    if (
      review.user.toString() !== req.user?._id &&
      req.user?.role !== "ADMIN"
    ) {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    review.deleteOne();
    await location.save();

    res.json({
      message: "Değerlendirme başarıyla silindi",
      ratings: location.ratings,
    });
  } catch (error: any) {
    console.error("Review silinirken hata:", error);
    res
      .status(500)
      .json({ message: "Review silinirken hata oluştu", error: error.message });
  }
};

export const getReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { locationId } = req.params;
    const location = await Location.findById(locationId).populate(
      "reviews.user",
      "username name"
    );

    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    res.json({
      reviews: location.reviews,
      ratings: location.ratings,
    });
  } catch (error: any) {
    console.error("Reviewlar getirilirken hata:", error);
    res.status(500).json({
      message: "Reviewlar getirilirken hata oluştu",
      error: error.message,
    });
  }
};

export const getReviewsByUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const locations = await Location.find({
      "reviews.user": userId,
    })
      .select("name reviews")
      .populate("reviews.user", "username name");

    const userReviews = locations.flatMap((location) =>
      location.reviews
        .filter((review: Review) => {
          const reviewUserId = (review.user as any)._id
            ? (review.user as any)._id.toString()
            : review.user.toString();
          const isMatch = reviewUserId === userId.toString();

          return isMatch;
        })
        .map((review: Review) => ({
          _id: review._id.toString(),
          locationId: location._id.toString(),
          locationName: location.name,
          rating: review.rating,
          comment: review.comment,
          visitDate: review.visitDate,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: {
            _id: (review.user as any)._id.toString(),
            username: (review.user as any).username,
            name: (review.user as any).name,
          },
        }))
    );

    res.json(userReviews);
  } catch (error: any) {
    console.error("Kullanıcı değerlendirmeleri getirilirken hata:", error);
    res.status(500).json({
      message: "Kullanıcı değerlendirmeleri getirilirken hata oluştu",
      error: error.message,
    });
  }
};

export const reportReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { locationId, reviewId } = req.params;
    const { reason } = req.body;

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    const review = (location.reviews as any).id(reviewId) as Review;
    if (!review) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    res.json({
      message: "Değerlendirme başarıyla raporlandı",
      reportedReview: {
        reviewId,
        reportedBy: req.user?.id,
        reason,
      },
    });
  } catch (error: any) {
    console.error("Review raporlanırken hata:", error);
    res.status(500).json({
      message: "Review raporlanırken hata oluştu",
      error: error.message,
    });
  }
};
