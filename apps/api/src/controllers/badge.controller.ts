import { Request, Response } from "express";
import { BadgeService } from "../services/badge.service";
import { Badge } from "../models/badge.model";
import { UserBadge } from "../models/user-badge.model";

export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userBadges = await UserBadge.find({ userId })
      .populate("badgeId")
      .lean()
      .exec();

    const transformedBadges = userBadges.map((badge) => ({
      ...badge,
      badge: badge.badgeId,
      badgeId: badge.badgeId._id,
    }));

    transformedBadges.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.json(transformedBadges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find().sort({ "criteria.requiredCount": 1 });
    res.json(badges);
  } catch (error) {
    console.error("Error fetching all badges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAndUpdateBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newBadges = await BadgeService.checkAllBadges(userId);
    res.json(newBadges);
  } catch (error) {
    console.error("Error checking and updating badges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
