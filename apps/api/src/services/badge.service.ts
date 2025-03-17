import { Badge, BadgeCategory } from "../models/badge.model";
import { UserBadge, IUserBadge } from "../models/user-badge.model";
import { Location } from "../models/location.model";
import { Types } from "mongoose";
import { ReviewComment } from "../models/review-comment.model";
import { ReviewReaction } from "../models/review-reaction.model";

export class BadgeService {
  private static async checkAndUpdateBadge(
    userId: string,
    badge: any,
    currentCount: number
  ): Promise<IUserBadge | null> {
    try {
      if (!badge._id) {
        console.error(`Geçersiz badge ID: ${badge._id}`);
        return null;
      }

      let userBadge = await UserBadge.findOne({
        userId,
        badgeId: badge._id,
      });

      if (!userBadge) {
        userBadge = await UserBadge.create({
          userId,
          badgeId: badge._id,
          progress: currentCount,
          unlockedAt: currentCount >= badge.requiredCount ? new Date() : null,
        });
      } else {
        userBadge.progress = currentCount;
        if (!userBadge.unlockedAt && currentCount >= badge.requiredCount) {
          userBadge.unlockedAt = new Date();
        }
        await userBadge.save();
      }

      return userBadge;
    } catch (error) {
      console.error(`Badge işleme hatası (${badge._id}):`, error);
      return null;
    }
  }

  static async checkAllBadges(userId: string): Promise<IUserBadge[]> {
    try {
      const [locationBadges, reviewBadges, interactionBadges, qualityBadges] =
        await Promise.all([
          this.checkLocationBadges(userId),
          this.checkReviewBadges(userId),
          this.checkInteractionBadges(userId),
          this.checkQualityBadges(userId),
        ]);

      return [
        ...locationBadges,
        ...reviewBadges,
        ...interactionBadges,
        ...qualityBadges,
      ].filter((badge): badge is IUserBadge => badge !== null);
    } catch (error) {
      console.error("Badge kontrol hatası:", error);
      return [];
    }
  }

  static async checkLocationBadges(userId: string): Promise<IUserBadge[]> {
    try {
      const locationCount = await Location.countDocuments({
        createdBy: userId,
      });
      const locationBadges = await Badge.find({
        category: BadgeCategory.LOCATION,
      });
      const results = await Promise.all(
        locationBadges.map((badge) =>
          this.checkAndUpdateBadge(userId, badge, locationCount)
        )
      );
      return results.filter((badge): badge is IUserBadge => badge !== null);
    } catch (error) {
      console.error("Location badge kontrol hatası:", error);
      return [];
    }
  }

  static async checkReviewBadges(userId: string): Promise<IUserBadge[]> {
    try {
      const reviews = await Location.aggregate([
        { $unwind: "$reviews" },
        { $match: { "reviews.user": new Types.ObjectId(userId) } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
      const reviewCount = reviews[0]?.count || 0;

      const reviewBadges = await Badge.find({ category: BadgeCategory.REVIEW });

      const results = await Promise.all(
        reviewBadges.map(async (badge) => {
          const result = await this.checkAndUpdateBadge(
            userId,
            badge,
            reviewCount
          );
          return result;
        })
      );

      return results.filter((badge): badge is IUserBadge => badge !== null);
    } catch (error) {
      console.error("Review badge kontrol hatası:", error);
      return [];
    }
  }

  static async checkInteractionBadges(userId: string): Promise<IUserBadge[]> {
    try {
      const [commentCount, likeCount] = await Promise.all([
        ReviewComment.countDocuments({ user: userId }),
        ReviewReaction.countDocuments({ user: userId, type: "like" }),
      ]);

      const interactionCount = commentCount + likeCount;

      const interactionBadges = await Badge.find({
        category: BadgeCategory.INTERACTION,
      });

      const results = await Promise.all(
        interactionBadges.map((badge) =>
          this.checkAndUpdateBadge(userId, badge, interactionCount)
        )
      );
      return results.filter((badge): badge is IUserBadge => badge !== null);
    } catch (error) {
      console.error("Interaction badge kontrol hatası:", error);
      return [];
    }
  }

  static async checkQualityBadges(userId: string): Promise<IUserBadge[]> {
    try {
      const highQualityReviews = await Location.aggregate([
        { $unwind: "$reviews" },
        {
          $match: {
            "reviews.user": new Types.ObjectId(userId),
            "reviews.comment": { $exists: true, $ne: "" },
            "reviews.imageUrl": { $exists: true, $ne: "" },
          },
        },
        {
          $addFields: {
            contentLength: { $strLenCP: "$reviews.comment" },
            reviewId: "$reviews._id",
          },
        },
        {
          $match: {
            contentLength: { $gte: 25 },
          },
        },
        {
          $lookup: {
            from: "reviewreactions",
            let: { reviewId: "$reviewId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$review", "$$reviewId"] },
                      { $eq: ["$type", "like"] },
                    ],
                  },
                },
              },
            ],
            as: "reactions",
          },
        },
        {
          $addFields: {
            likeCount: { $size: "$reactions" },
            qualityScore: {
              $add: [
                { $size: "$reactions" },
                { $cond: [{ $gte: ["$contentLength", 100] }, 2, 0] },
                { $cond: [{ $gte: ["$contentLength", 50] }, 1, 0] },
              ],
            },
          },
        },
        {
          $match: {
            qualityScore: { $gte: 1 },
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);

      const highQualityCount = highQualityReviews[0]?.count || 0;

      const qualityBadges = await Badge.find({
        category: BadgeCategory.QUALITY,
      });

      const results = await Promise.all(
        qualityBadges.map((badge) =>
          this.checkAndUpdateBadge(userId, badge, highQualityCount)
        )
      );

      return results.filter((badge): badge is IUserBadge => badge !== null);
    } catch (error) {
      console.error("Quality badge kontrol hatası:", error);
      return [];
    }
  }
}
