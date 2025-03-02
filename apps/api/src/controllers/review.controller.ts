import { Request, Response } from "express";
import { Location } from "../models/location.model";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
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
    reviewData.user = req.user?.id;

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    // Check if user has already reviewed
    const existingReview = location.reviews.find(
      (review) => review.user.toString() === req.user?.id
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

    const review = location.reviews.id(reviewId);
    if (!review) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    // Check if the user owns the review or is admin
    if (review.user.toString() !== req.user?.id && req.user?.role !== "ADMIN") {
      res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      return;
    }

    // Update review fields
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
    res
      .status(500)
      .json({
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

    const review = location.reviews.id(reviewId);
    if (!review) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    // Check if the user owns the review or is admin
    if (review.user.toString() !== req.user?.id && req.user?.role !== "ADMIN") {
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
    res
      .status(500)
      .json({
        message: "Reviewlar getirilirken hata oluştu",
        error: error.message,
      });
  }
};

export const getReviewsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const locations = await Location.find({ "reviews.user": userId }).populate(
      "reviews.user",
      "username name"
    );

    const userReviews = locations.flatMap((location) => {
      return location.reviews
        .filter((review) => review.user.toString() === userId)
        .map((review) => ({
          locationId: location._id,
          locationName: location.name,
          review,
        }));
    });

    res.json(userReviews);
  } catch (error: any) {
    console.error("Kullanıcı reviewları getirilirken hata:", error);
    res
      .status(500)
      .json({
        message: "Kullanıcı reviewları getirilirken hata oluştu",
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

    const review = location.reviews.id(reviewId);
    if (!review) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    // Burada report collection'a kayıt eklenebilir
    // Şimdilik sadece başarılı response dönüyoruz
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
    res
      .status(500)
      .json({
        message: "Review raporlanırken hata oluştu",
        error: error.message,
      });
  }
};
