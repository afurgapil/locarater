import { Request, Response } from "express";
import { AuthRequest } from "../types/auth";
import { Location } from "../models/location.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { ReviewReaction } from "../models/review-reaction.model";
import { ReviewComment } from "../models/review-comment.model";
import { BadgeService } from "../services/badge.service";
import { BadgeNotification } from "../models/badge-notification.model";
import { BadgeReaction } from "../models/badge-reaction.model";
import { BadgeComment } from "../models/badge-comment.model";

export const getFeed = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const followingIds = currentUser.following;
    if (!followingIds || followingIds.length === 0) {
      return res.json({
        feed: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      });
    }

    const locationsWithReviews = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": {
            $in: followingIds.map(
              (id) => new mongoose.Types.ObjectId(id.toString())
            ),
          },
        },
      },
      {
        $sort: { "reviews.createdAt": -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "users",
          localField: "reviews.user",
          foreignField: "_id",
          as: "reviewer",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          address: 1,
          imageUrl: 1,
          review: "$reviews",
          reviewer: { $arrayElemAt: ["$reviewer", 0] },
        },
      },
    ]);

    const locations = await Location.find({ createdBy: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username name imageUrl")
      .skip(skip)
      .limit(limit);

    const reviewItems = locationsWithReviews.map((item: any) => ({
      type: "review",
      data: {
        location: {
          _id: item._id,
          name: item.name,
          category: item.category,
          address: item.address,
          imageUrl: item.imageUrl,
        },
        review: {
          _id: item.review._id,
          rating: item.review.rating,
          comment: item.review.comment,
          createdAt: item.review.createdAt,
          likes: 0,
          dislikes: 0,
          userReaction: null,
        },
        reviewer: item.reviewer,
      },
      createdAt: item.review.createdAt,
    }));

    const locationItems = locations.map((location) => ({
      type: "location",
      data: {
        location: {
          _id: location._id,
          name: location.name,
          category: location.category,
          address: location.address,
          imageUrl: location.imageUrl,
        },
        creator: location.createdBy,
      },
      createdAt: location.createdAt,
    }));

    const badgeNotifications = await BadgeNotification.aggregate([
      {
        $match: {
          userId: {
            $in: followingIds.map(
              (id) => new mongoose.Types.ObjectId(id.toString())
            ),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          type: { $literal: "BADGE" },
          createdAt: 1,
          data: {
            badge: {
              _id: "$badgeId",
              name: "$badgeName",
              category: "$badgeCategory",
              image: "$badgeImage",
            },
            user: {
              _id: "$user._id",
              name: "$user.name",
              username: "$user.username",
              imageUrl: "$user.imageUrl",
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const allItems = [
      ...badgeNotifications,
      ...reviewItems,
      ...locationItems,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const reviewIds = reviewItems.map((item: any) => item.data.review._id);
    const userReactions = await ReviewReaction.find({
      user: userId,
      review: { $in: reviewIds },
    });

    const reactionCounts = await ReviewReaction.aggregate([
      { $match: { review: { $in: reviewIds } } },
      {
        $group: {
          _id: { review: "$review", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]);

    const reviewCommentCounts = await ReviewComment.aggregate([
      { $match: { review: { $in: reviewIds } } },
      {
        $group: {
          _id: "$review",
          count: { $sum: 1 },
        },
      },
    ]);

    const badgeNotificationIds = badgeNotifications.map(
      (item: any) => item._id
    );

    const badgeUserReactions = await BadgeReaction.find({
      user: userId,
      badgeNotification: { $in: badgeNotificationIds },
    });

    const badgeReactionCounts = await BadgeReaction.aggregate([
      { $match: { badgeNotification: { $in: badgeNotificationIds } } },
      {
        $group: {
          _id: { badgeNotification: "$badgeNotification", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]);

    const badgeCommentCounts = await BadgeComment.aggregate([
      { $match: { badgeNotification: { $in: badgeNotificationIds } } },
      {
        $group: {
          _id: "$badgeNotification",
          count: { $sum: 1 },
        },
      },
    ]);

    reviewItems.forEach((item: any) => {
      const likes = reactionCounts.filter(
        (count: any) =>
          count._id.review.toString() === item.data.review._id.toString() &&
          count._id.type === "like"
      );
      const dislikes = reactionCounts.filter(
        (count: any) =>
          count._id.review.toString() === item.data.review._id.toString() &&
          count._id.type === "dislike"
      );

      item.data.review.likes = likes.length > 0 ? likes[0].count : 0;
      item.data.review.dislikes = dislikes.length > 0 ? dislikes[0].count : 0;

      const userReaction = userReactions.find(
        (reaction) =>
          reaction.review.toString() === item.data.review._id.toString()
      );
      item.data.review.userReaction = userReaction ? userReaction.type : null;

      const commentCount = reviewCommentCounts.find(
        (count: any) => count._id.toString() === item.data.review._id.toString()
      );
      item.data.review.commentCount = commentCount ? commentCount.count : 0;
    });

    badgeNotifications.forEach((item: any) => {
      if (!item.data.badge.likes) {
        item.data.badge.likes = 0;
        item.data.badge.dislikes = 0;
        item.data.badge.userReaction = null;
        item.data.badge.commentCount = 0;
      }

      const likes = badgeReactionCounts.filter(
        (count: any) =>
          count._id.badgeNotification.toString() === item._id.toString() &&
          count._id.type === "like"
      );
      const dislikes = badgeReactionCounts.filter(
        (count: any) =>
          count._id.badgeNotification.toString() === item._id.toString() &&
          count._id.type === "dislike"
      );

      item.data.badge.likes = likes.length > 0 ? likes[0].count : 0;
      item.data.badge.dislikes = dislikes.length > 0 ? dislikes[0].count : 0;

      const userReaction = badgeUserReactions.find(
        (reaction) =>
          reaction.badgeNotification.toString() === item._id.toString()
      );
      item.data.badge.userReaction = userReaction ? userReaction.type : null;

      const commentCount = badgeCommentCounts.find(
        (count: any) => count._id.toString() === item._id.toString()
      );
      item.data.badge.commentCount = commentCount ? commentCount.count : 0;
    });

    const totalReviews = await Location.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.user": {
            $in: followingIds.map(
              (id) => new mongoose.Types.ObjectId(id.toString())
            ),
          },
        },
      },
      {
        $count: "total",
      },
    ]);

    const totalLocations = await Location.countDocuments({
      createdBy: { $in: followingIds },
    });

    const totalItems = (totalReviews[0]?.total || 0) + totalLocations;
    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      feed: allItems.slice(0, limit),
      pagination: {
        total: totalItems,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Feed getirme hatası:", error);
    return res
      .status(500)
      .json({ message: "Feed getirilirken bir hata oluştu" });
  }
};

export const likeReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const location = await Location.findOne({ "reviews._id": reviewId });
    if (!location) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    const existingReaction = await ReviewReaction.findOne({
      user: userId,
      review: reviewId,
    });

    if (existingReaction) {
      if (existingReaction.type === "like") {
        res
          .status(200)
          .json({ message: "Bu değerlendirmeyi zaten beğendiniz" });
        return;
      }

      existingReaction.type = "like";
      await existingReaction.save();
    } else {
      await ReviewReaction.create({
        user: userId,
        review: reviewId,
        type: "like",
      });
    }

    await BadgeService.checkInteractionBadges(userId);

    res.status(200).json({ message: "Değerlendirme başarıyla beğenildi" });
  } catch (error) {
    console.error("Değerlendirme beğenme hatası:", error);
    res
      .status(500)
      .json({ message: "Değerlendirme beğenilirken bir hata oluştu" });
  }
};

export const dislikeReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const location = await Location.findOne({ "reviews._id": reviewId });
    if (!location) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    const existingReaction = await ReviewReaction.findOne({
      user: userId,
      review: reviewId,
    });

    if (existingReaction) {
      if (existingReaction.type === "dislike") {
        res
          .status(200)
          .json({ message: "Bu değerlendirmeyi zaten beğenmediniz" });
        return;
      }

      existingReaction.type = "dislike";
      await existingReaction.save();
    } else {
      await ReviewReaction.create({
        user: userId,
        review: reviewId,
        type: "dislike",
      });
    }

    res.status(200).json({ message: "Değerlendirme başarıyla beğenilmedi" });
  } catch (error) {
    console.error("Değerlendirme beğenmeme hatası:", error);
    res
      .status(500)
      .json({ message: "Değerlendirme beğenilmezken bir hata oluştu" });
  }
};

export const removeReaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const result = await ReviewReaction.deleteOne({
      user: userId,
      review: reviewId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Tepki bulunamadı" });
      return;
    }

    res.status(200).json({ message: "Tepki başarıyla kaldırıldı" });
  } catch (error) {
    console.error("Tepki kaldırma hatası:", error);
    res.status(500).json({ message: "Tepki kaldırılırken bir hata oluştu" });
  }
};

export const getReviewComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reviewId } = req.params;

    const location = await Location.findOne({ "reviews._id": reviewId });
    if (!location) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    const comments = await ReviewComment.find({ review: reviewId })
      .sort({ createdAt: 1 })
      .populate("user", "username name imageUrl");

    res.status(200).json(comments);
  } catch (error) {
    console.error("Yorum getirme hatası:", error);
    res.status(500).json({ message: "Yorumlar getirilirken bir hata oluştu" });
  }
};

export const addComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    if (!content || content.trim() === "") {
      res.status(400).json({ message: "Yorum içeriği boş olamaz" });
      return;
    }

    const location = await Location.findOne({ "reviews._id": reviewId });
    if (!location) {
      res.status(404).json({ message: "Değerlendirme bulunamadı" });
      return;
    }

    const newComment = await ReviewComment.create({
      user: userId,
      review: reviewId,
      content,
    });

    await BadgeService.checkInteractionBadges(userId);

    const populatedComment = await ReviewComment.findById(
      newComment._id
    ).populate("user", "username name imageUrl");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);
    res.status(500).json({ message: "Yorum eklenirken bir hata oluştu" });
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { reviewId, commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const comment = await ReviewComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: "Yorum bulunamadı" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    if (comment.user.toString() !== userId && user.role !== "ADMIN") {
      res.status(403).json({ message: "Bu yorumu silme yetkiniz yok" });
      return;
    }

    await ReviewComment.deleteOne({ _id: commentId });

    res.status(200).json({ message: "Yorum başarıyla silindi" });
  } catch (error) {
    console.error("Yorum silme hatası:", error);
    res.status(500).json({ message: "Yorum silinirken bir hata oluştu" });
  }
};

export const likeBadgeNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { badgeNotificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const badgeNotification =
      await BadgeNotification.findById(badgeNotificationId);
    if (!badgeNotification) {
      res.status(404).json({ message: "Rozet bildirimi bulunamadı" });
      return;
    }

    const existingReaction = await BadgeReaction.findOne({
      user: userId,
      badgeNotification: badgeNotificationId,
    });

    if (existingReaction) {
      if (existingReaction.type === "like") {
        res
          .status(200)
          .json({ message: "Bu rozet bildirimini zaten beğendiniz" });
        return;
      }

      existingReaction.type = "like";
      await existingReaction.save();
    } else {
      await BadgeReaction.create({
        user: userId,
        badgeNotification: badgeNotificationId,
        type: "like",
      });
    }

    await BadgeService.checkInteractionBadges(userId);

    res.status(200).json({ message: "Rozet bildirimi başarıyla beğenildi" });
  } catch (error) {
    console.error("Rozet bildirimi beğenme hatası:", error);
    res
      .status(500)
      .json({ message: "Rozet bildirimi beğenilirken bir hata oluştu" });
  }
};

export const dislikeBadgeNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { badgeNotificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const badgeNotification =
      await BadgeNotification.findById(badgeNotificationId);
    if (!badgeNotification) {
      res.status(404).json({ message: "Rozet bildirimi bulunamadı" });
      return;
    }

    const existingReaction = await BadgeReaction.findOne({
      user: userId,
      badgeNotification: badgeNotificationId,
    });

    if (existingReaction) {
      if (existingReaction.type === "dislike") {
        res
          .status(200)
          .json({ message: "Bu rozet bildirimini zaten beğenmediniz" });
        return;
      }

      existingReaction.type = "dislike";
      await existingReaction.save();
    } else {
      await BadgeReaction.create({
        user: userId,
        badgeNotification: badgeNotificationId,
        type: "dislike",
      });
    }

    res.status(200).json({ message: "Rozet bildirimi başarıyla beğenilmedi" });
  } catch (error) {
    console.error("Rozet bildirimi beğenmeme hatası:", error);
    res
      .status(500)
      .json({ message: "Rozet bildirimi beğenilmezken bir hata oluştu" });
  }
};

export const removeBadgeNotificationReaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { badgeNotificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const result = await BadgeReaction.deleteOne({
      user: userId,
      badgeNotification: badgeNotificationId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        message: "Bu rozet bildirimine daha önce bir tepki vermemişsiniz",
      });
      return;
    }

    res
      .status(200)
      .json({ message: "Rozet bildirimi tepkisi başarıyla kaldırıldı" });
  } catch (error) {
    console.error("Rozet bildirimi tepkisi kaldırma hatası:", error);
    res.status(500).json({
      message: "Rozet bildirimi tepkisi kaldırılırken bir hata oluştu",
    });
  }
};

export const getBadgeNotificationComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { badgeNotificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const badgeNotification =
      await BadgeNotification.findById(badgeNotificationId);
    if (!badgeNotification) {
      res.status(404).json({ message: "Rozet bildirimi bulunamadı" });
      return;
    }

    const comments = await BadgeComment.find({
      badgeNotification: badgeNotificationId,
    })
      .sort({ createdAt: -1 })
      .populate("user", "name username imageUrl");

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user,
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("Rozet bildirimi yorumları alma hatası:", error);
    res.status(500).json({
      message: "Rozet bildirimi yorumları alınırken bir hata oluştu",
    });
  }
};

export const addBadgeNotificationComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { badgeNotificationId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    if (!content || !content.trim()) {
      res.status(400).json({ message: "Yorum içeriği gereklidir" });
      return;
    }

    const badgeNotification =
      await BadgeNotification.findById(badgeNotificationId);
    if (!badgeNotification) {
      res.status(404).json({ message: "Rozet bildirimi bulunamadı" });
      return;
    }

    const newComment = await BadgeComment.create({
      user: userId,
      badgeNotification: badgeNotificationId,
      content: content.trim(),
    });

    const populatedComment = await BadgeComment.findById(
      newComment._id
    ).populate("user", "name username imageUrl");

    const formattedComment = {
      _id: populatedComment?._id,
      content: populatedComment?.content,
      createdAt: populatedComment?.createdAt,
      user: populatedComment?.user,
    };

    await BadgeService.checkInteractionBadges(userId);

    res.status(201).json(formattedComment);
  } catch (error) {
    console.error("Rozet bildirimi yorumu ekleme hatası:", error);
    res
      .status(500)
      .json({ message: "Rozet bildirimi yorumu eklenirken bir hata oluştu" });
  }
};

export const deleteBadgeNotificationComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { badgeNotificationId, commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const comment = await BadgeComment.findById(commentId).populate("user");
    if (!comment) {
      res.status(404).json({ message: "Yorum bulunamadı" });
      return;
    }

    if (comment.badgeNotification.toString() !== badgeNotificationId) {
      res.status(400).json({ message: "Geçersiz yorum ve rozet bildirimi" });
      return;
    }

    if (comment.user._id.toString() !== userId && userRole !== "ADMIN") {
      res.status(403).json({
        message: "Bu yorumu silme yetkiniz yok",
      });
      return;
    }

    await BadgeComment.findByIdAndDelete(commentId);

    res.status(200).json({ message: "Yorum başarıyla silindi" });
  } catch (error) {
    console.error("Rozet bildirimi yorumu silme hatası:", error);
    res
      .status(500)
      .json({ message: "Rozet bildirimi yorumu silinirken bir hata oluştu" });
  }
};
