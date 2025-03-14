import { Request, Response } from "express";
import { Location, ILocation } from "../models/location.model";
import mongoose from "mongoose";
import { AuthRequest } from "../types/auth";
import imageService from "../services/image.service";

interface Rating {
  overall: number;
  taste?: number;
  service?: number;
  ambiance?: number;
  pricePerformance?: number;
}

interface ReviewData {
  rating: Rating;
  comment?: string;
  visitDate?: string;
  imagePath?: string;
  imageUrl?: string;
}

interface BaseReview {
  _id: mongoose.Types.ObjectId;
  rating: Rating;
  comment?: string;
  visitDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  imagePath?: string;
  imageUrl?: string;
}

interface MongoReview extends BaseReview {
  user: mongoose.Types.ObjectId;
}

interface PopulatedReview extends BaseReview {
  user: {
    id: mongoose.Types.ObjectId;
    username: string;
    name: string;
  };
}

interface ReviewRequest extends AuthRequest {
  body: ReviewData;
  imagePath?: string;
}

type Review = MongoReview | PopulatedReview;

export const addReview = async (
  req: ReviewRequest,
  res: Response
): Promise<void> => {
  try {
    const locationId = req.params.locationId;
    const reviewData = req.body;

    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Mekan bulunamadı" });
      return;
    }

    const existingReview = location.reviews.find(
      (review) => review.user.toString() === req.user?.id
    );

    if (existingReview) {
      res
        .status(400)
        .json({ message: "Bu mekan için zaten bir değerlendirmeniz var" });
      return;
    }

    let imageUrl, imagePath;
    if (req.imagePath) {
      imagePath = req.imagePath;
      imageUrl = imageService.getPublicUrl(imagePath, "reviews");
    }

    const newReview = {
      _id: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(req.user.id),
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
      imagePath,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    location.reviews.push(newReview);
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
  req: ReviewRequest,
  res: Response
): Promise<Response> => {
  try {
    const { locationId, reviewId } = req.params;
    const reviewData = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Mekan bulunamadı" });
    }

    const review = location.reviews.find((r) => r._id.toString() === reviewId);

    if (!review) {
      return res.status(404).json({ message: "Değerlendirme bulunamadı" });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    if (req.imagePath) {
      if (review.imagePath) {
        try {
          await imageService.deleteImage(review.imagePath, "reviews");
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      review.imagePath = req.imagePath;
      review.imageUrl = imageService.getPublicUrl(req.imagePath, "reviews");
    }

    Object.assign(review, {
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
        : review.visitDate,
      updatedAt: new Date(),
    });

    await location.save();

    const updatedLocation = await Location.findById(locationId).populate(
      "reviews.user",
      "username name"
    );

    return res.json({
      message: "Değerlendirme başarıyla güncellendi",
      review: updatedLocation?.reviews.find(
        (r) => r._id.toString() === reviewId
      ),
      ratings: updatedLocation?.ratings,
    });
  } catch (error: any) {
    console.error("Review güncellenirken hata:", error);
    return res.status(500).json({
      message: "Review güncellenirken hata oluştu",
      error: error.message,
    });
  }
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { locationId, reviewId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Mekan bulunamadı" });
    }

    const review = location.reviews.find((r) => r._id.toString() === reviewId);

    if (!review) {
      return res.status(404).json({ message: "Değerlendirme bulunamadı" });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    if (review.imagePath) {
      try {
        await imageService.deleteImage(review.imagePath, "reviews");
      } catch (error) {
        console.error("Error deleting review image:", error);
      }
    }

    location.reviews = location.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );
    await location.save();

    return res.json({
      message: "Değerlendirme başarıyla silindi",
      ratings: location.ratings,
    });
  } catch (error: any) {
    console.error("Review silinirken hata:", error);
    return res.status(500).json({
      message: "Review silinirken hata oluştu",
      error: error.message,
    });
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
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const locations = await Location.find({
      "reviews.user": userId,
    })
      .select("name reviews")
      .populate("reviews.user", "username name");

    const userReviews = locations.flatMap((location) =>
      location.reviews
        .filter((review: any) => {
          const reviewUserId = review.user._id || review.user;
          return reviewUserId.toString() === userId.toString();
        })
        .map((review: any) => ({
          _id: review._id.toString(),
          locationId: location._id ? location._id.toString() : "",
          locationName: location.name,
          rating: review.rating,
          comment: review.comment,
          visitDate: review.visitDate,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: {
            id: review.user._id.toString(),
            username: review.user.username,
            name: review.user.name,
          },
        }))
    );

    return res.json(userReviews);
  } catch (error: any) {
    console.error("Kullanıcı değerlendirmeleri getirilirken hata:", error);
    return res.status(500).json({
      message: "Kullanıcı değerlendirmeleri getirilirken hata oluştu",
      error: error.message,
    });
  }
};

export const reportReview = async (
  req: AuthRequest,
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

    const review = location.reviews.find(
      (r: any) => r._id.toString() === reviewId
    ) as Review | undefined;

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

export const getAllReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filters: any = {};

    if (req.query.minRating) {
      const minRating = parseFloat(req.query.minRating as string);
      filters["reviews.rating.overall"] = { $gte: minRating };
    }

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      filters["reviews.createdAt"] = { $gte: startDate, $lte: endDate };
    }

    const locations = await Location.find(filters)
      .select("name reviews")
      .populate("reviews.user", "username name")
      .skip(skip)
      .limit(limit);

    const allReviews = locations.flatMap((location) =>
      location.reviews.map((review: any) => ({
        _id: review._id.toString(),
        locationId: location._id ? location._id.toString() : "",
        locationName: location.name,
        rating: review.rating,
        comment: review.comment,
        visitDate: review.visitDate,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          _id: review.user._id.toString(),
          username: review.user.username,
          name: review.user.name,
        },
      }))
    );

    const totalLocations = await Location.countDocuments(filters);
    const totalReviews = allReviews.length;

    res.json({
      reviews: allReviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        totalPages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (error: any) {
    console.error("Tüm değerlendirmeler getirilirken hata:", error);
    res.status(500).json({
      message: "Tüm değerlendirmeler getirilirken hata oluştu",
      error: error.message,
    });
  }
};
