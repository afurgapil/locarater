import { Request, Response } from "express";
import { Location } from "../models/location.model";
import { AuthRequest } from "../types/auth";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;

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

    const locationTrend =
      previousLocationCount === 0
        ? 100
        : ((currentLocationCount - previousLocationCount) /
            previousLocationCount) *
          100;

    const reviewTrend =
      previousReviewCount === 0
        ? 100
        : ((currentReviewCount - previousReviewCount) / previousReviewCount) *
          100;

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
    const userId = req.user?._id;

    const recentLocations = await Location.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name reviewCount averageRating createdAt");

    const recentReviews = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": userId,
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
          "reviews.user": userId,
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
