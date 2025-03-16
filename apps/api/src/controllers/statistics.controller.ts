import { Request, Response } from "express";
import { Location } from "../models/location.model";
import { AuthRequest } from "../types/auth";
import { Types } from "mongoose";
import { User } from "../models/user.model";
import mongoose from "mongoose";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;

    const totalLocations = await Location.countDocuments();

    const reviewStats = await Location.aggregate([
      {
        $project: {
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: "$reviewCount" },
        },
      },
    ]);
    const totalReviews = reviewStats[0]?.totalReviews || 0;

    const userLocationsCount = await Location.countDocuments({
      createdBy: userId,
    });
    const userReviewsCount = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userId,
        },
      },
      {
        $count: "total",
      },
    ]);

    const recentLocations = await Location.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id name createdAt");

    const recentReviews = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $sort: { "reviews.createdAt": -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: "$reviews._id",
          locationName: "$name",
          rating: "$reviews.rating.overall",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
        },
      },
    ]);

    const topLocations = await Location.aggregate([
      {
        $project: {
          name: 1,
          reviewCount: { $size: "$reviews" },
          averageRating: {
            $cond: {
              if: { $eq: [{ $size: "$reviews" }, 0] },
              then: 0,
              else: { $avg: "$reviews.rating.overall" },
            },
          },
        },
      },
      {
        $sort: { reviewCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(
      last7Days.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    const [currentLocationCount, previousLocationCount] = await Promise.all([
      Location.countDocuments({ createdAt: { $gte: last7Days } }),
      Location.countDocuments({
        createdAt: { $gte: previous7Days, $lt: last7Days },
      }),
    ]);

    const reviewTrends = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $group: {
          _id: null,
          currentPeriod: {
            $sum: {
              $cond: [{ $gte: ["$reviews.createdAt", last7Days] }, 1, 0],
            },
          },
          previousPeriod: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$reviews.createdAt", previous7Days] },
                    { $lt: ["$reviews.createdAt", last7Days] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const currentReviewCount = reviewTrends[0]?.currentPeriod || 0;
    const previousReviewCount = reviewTrends[0]?.previousPeriod || 0;

    let locationTrend = 0;
    let reviewTrend = 0;

    if (previousLocationCount === 0 && currentLocationCount === 0) {
      locationTrend = 0;
    } else if (previousLocationCount === 0) {
      locationTrend = 100;
    } else {
      locationTrend =
        ((currentLocationCount - previousLocationCount) /
          previousLocationCount) *
        100;
    }

    if (previousReviewCount === 0 && currentReviewCount === 0) {
      reviewTrend = 0;
    } else if (previousReviewCount === 0) {
      reviewTrend = 100;
    } else {
      reviewTrend =
        ((currentReviewCount - previousReviewCount) / previousReviewCount) *
        100;
    }

    return res.json({
      totalLocations,
      totalReviews,
      userStats: {
        locationsCount: userLocationsCount,
        reviewsCount: userReviewsCount[0]?.total || 0,
      },
      recentActivities: {
        locations: recentLocations.map((loc) => ({
          _id: loc._id,
          name: loc.name,
          createdAt: loc.createdAt,
        })),
        reviews: recentReviews,
      },
      topLocations,
      trends: {
        locations: locationTrend.toFixed(1),
        reviews: reviewTrend.toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      message: "İstatistikler alınırken bir hata oluştu",
    });
  }
};

export const getUserStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Kullanıcı kimliği bulunamadı" });
    }

    const userObjectId = new Types.ObjectId(userId);

    const recentLocations = await Location.find({ createdBy: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name reviewCount averageRating createdAt");

    const recentReviews = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userObjectId,
        },
      },
      {
        $sort: { "reviews.createdAt": -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: "$reviews._id",
          location: {
            _id: "$_id",
            name: "$name",
          },
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
        },
      },
    ]);

    const topCategories = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userObjectId,
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating.overall" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.json({
      recentLocations,
      recentReviews,
      topCategories,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({
      message: "Kullanıcı istatistikleri alınırken bir hata oluştu",
    });
  }
};

export const getPublicProfileStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Geçersiz kullanıcı adı" });
    }

    const user = await User.findOne({ username })
      .select("username name imageUrl createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const userObjectId = user._id;

    const userLocationsCount = await Location.countDocuments({
      createdBy: userObjectId,
    });

    const userReviewsStats = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userObjectId,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating.overall" },
        },
      },
    ]);

    const userReviewsCount = userReviewsStats[0]?.count || 0;
    const userAverageRating = userReviewsStats[0]?.averageRating || 0;

    const recentLocations = await Location.find({ createdBy: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name category averageRating reviewCount createdAt")
      .lean();

    const locationsWithStats = await Promise.all(
      recentLocations.map(async (location) => {
        const locationWithReviews = await Location.findById(location._id)
          .select("reviews")
          .lean();

        const reviewCount = locationWithReviews?.reviews?.length || 0;

        let averageRating = 0;
        if (
          reviewCount > 0 &&
          locationWithReviews &&
          locationWithReviews.reviews
        ) {
          const totalRating = locationWithReviews.reviews.reduce(
            (sum, review) => sum + (review.rating?.overall || 0),
            0
          );
          averageRating = totalRating / reviewCount;
        }

        return {
          ...location,
          reviewCount,
          averageRating: parseFloat(averageRating.toFixed(1)) || 0,
        };
      })
    );

    const recentReviews = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userObjectId,
        },
      },
      {
        $sort: { "reviews.createdAt": -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: "$reviews._id",
          location: {
            _id: "$_id",
            name: "$name",
          },
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
        },
      },
    ]);

    const topCategories = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userObjectId,
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating.overall" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return res.json({
      user,
      stats: {
        locationsCount: userLocationsCount,
        reviewsCount: userReviewsCount,
        averageRating: parseFloat(userAverageRating.toFixed(1)) || 0,
        memberSince: user.createdAt,
      },
      recentActivity: {
        locations: locationsWithStats,
        reviews: recentReviews,
      },
      topCategories: topCategories.map((category) => ({
        category: category._id,
        count: category.count,
        averageRating: parseFloat(category.averageRating?.toFixed(1)) || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching public profile stats:", error);
    return res.status(500).json({
      message: "Genel profil istatistikleri alınırken bir hata oluştu",
    });
  }
};
