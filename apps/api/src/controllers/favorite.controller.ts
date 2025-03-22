import { Request, Response } from "express";
import Favorite from "../models/favorite.model";

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.body;
    const userId = req.user?._id;

    if (!locationId || !userId) {
      return res.status(400).json({ message: "Geçersiz istek" });
    }

    const favorite = await Favorite.create({
      user: userId,
      location: locationId,
    });

    const populatedFavorite = await favorite.populate({
      path: "location",
      select: "_id name description address category rating imageUrl",
    });

    res.status(201).json(populatedFavorite);
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Bu mekan zaten favorilerinizde" });
    }
    res.status(500).json({ message: "Bir hata oluştu", error: error.message });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const userId = req.user?._id;

    if (!locationId || !userId) {
      return res.status(400).json({ message: "Geçersiz istek" });
    }

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      location: locationId,
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favori bulunamadı" });
    }

    res.status(200).json({ message: "Favori başarıyla kaldırıldı" });
  } catch (error: any) {
    res.status(500).json({ message: "Bir hata oluştu", error: error.message });
  }
};

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Geçersiz istek" });
    }

    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: "location",
        select:
          "_id name description address category imageUrl ratings reviews reviewCount createdAt updatedAt",
        populate: [
          {
            path: "reviews",
            select: "rating comment visitDate imageUrl createdAt updatedAt",
            populate: {
              path: "user",
              select: "_id username name imageUrl",
            },
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(favorites);
  } catch (error: any) {
    res.status(500).json({ message: "Bir hata oluştu", error: error.message });
  }
};
