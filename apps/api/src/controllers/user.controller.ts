import { Request, Response } from "express";
import { User, IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import { Location } from "../models/location.model";
import { AuthRequest } from "../types/auth";
import imageService from "../services/image.service";
import mongoose from "mongoose";

interface UserRequest extends AuthRequest {
  body: {
    username?: string;
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    imageUrl?: string;
  };
  imageUrl?: string;
}

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({
      message: "Kullanıcı bilgileri getirilirken hata oluştu",
      error: error.message,
    });
  }
};
export const getUserByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({
      message: "Kullanıcı bulunurken hata oluştu",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const updateData = { ...req.body };

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    delete updateData.password;
    delete updateData.role;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    if (req.imageUrl) {
      if (existingUser.imageUrl) {
        try {
          await imageService.deleteImage(existingUser.imageUrl, "users");
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }
      updateData.imageUrl = req.imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    res.json({
      message: "Profil başarıyla güncellendi",
      user,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Profil güncellenirken hata oluştu",
      error: error.message,
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      res.status(401).json({ message: "Mevcut şifre hatalı" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.json({ message: "Şifre başarıyla güncellendi" });
  } catch (error: any) {
    res.status(500).json({
      message: "Şifre güncellenirken hata oluştu",
      error: error.message,
    });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Yetkilendirme hatası" });
      return;
    }

    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    // Delete user's profile image if exists
    if (user.imageUrl) {
      try {
        await imageService.deleteImage(user.imageUrl, "users");
      } catch (error) {
        console.error("Error deleting user image:", error);
      }
    }

    // Delete user's locations and their images
    const userLocations = await Location.find({ createdBy: userId });
    for (const location of userLocations) {
      if (location.imageUrl) {
        try {
          await imageService.deleteImage(location.imageUrl, "locations");
        } catch (error) {
          console.error("Error deleting location image:", error);
        }
      }

      // Delete review images from this location
      for (const review of location.reviews) {
        if (review.imageUrl) {
          try {
            await imageService.deleteImage(review.imageUrl, "reviews");
          } catch (error) {
            console.error("Error deleting review image:", error);
          }
        }
      }
    }

    // Delete user's reviews and their images from other locations
    const locationsWithUserReviews = await Location.find({
      "reviews.user": userId,
    });

    for (const location of locationsWithUserReviews) {
      const userReviews = location.reviews.filter(
        (review) => review.user.toString() === userId.toString()
      );

      for (const review of userReviews) {
        if (review.imageUrl) {
          try {
            await imageService.deleteImage(review.imageUrl, "reviews");
          } catch (error) {
            console.error("Error deleting review image:", error);
          }
        }
      }

      location.reviews = location.reviews.filter(
        (review) => review.user.toString() !== userId.toString()
      );

      if (location.reviews.length > 0) {
        const totalRating = location.reviews.reduce((sum, review) => {
          return sum + (review.rating?.overall || 0);
        }, 0);

        location.ratings.average = totalRating / location.reviews.length;
        location.ratings.count = location.reviews.length;

        const distribution = {
          10: 0,
          9: 0,
          8: 0,
          7: 0,
          6: 0,
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        location.reviews.forEach((review) => {
          if (review.rating?.overall) {
            const rating = Math.round(review.rating.overall);
            if (rating >= 1 && rating <= 10) {
              distribution[rating as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10]++;
            }
          }
        });

        location.ratings.distribution = distribution;
      } else {
        location.ratings.average = 0;
        location.ratings.count = 0;
        location.ratings.distribution = {
          10: 0,
          9: 0,
          8: 0,
          7: 0,
          6: 0,
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };
      }

      await location.save();
    }

    await Location.deleteMany({ createdBy: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Hesabınız başarıyla silindi" });
  } catch (error: any) {
    res.status(500).json({
      message: "Hesap silinirken hata oluştu",
      error: error.message,
    });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { identifier, role } = req.body;

    if (!identifier || !role) {
      res.status(400).json({ message: "Kullanıcı bilgisi ve rol gereklidir" });
      return;
    }

    const validRoles = ["USER", "ADMIN", "BUSINESS_OWNER"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: "Geçersiz rol değeri" });
      return;
    }

    const query = identifier.includes("@")
      ? { email: identifier }
      : { username: identifier };

    const user = await User.findOne(query);

    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    user.role = role;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: "Kullanıcı rolü başarıyla güncellendi",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Kullanıcı rolü güncellenirken hata oluştu",
      error: error.message,
    });
  }
};

export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({
      message: "Kullanıcılar getirilirken hata oluştu",
      error: error.message,
    });
  }
};

export const forceDeleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    // Delete user's profile image if exists
    if (user.imageUrl) {
      try {
        await imageService.deleteImage(user.imageUrl, "users");
      } catch (error) {
        console.error("Error deleting user image:", error);
      }
    }

    // Delete user's locations and their images
    const userLocations = await Location.find({ createdBy: userId });
    for (const location of userLocations) {
      if (location.imageUrl) {
        try {
          await imageService.deleteImage(location.imageUrl, "locations");
        } catch (error) {
          console.error("Error deleting location image:", error);
        }
      }

      // Delete review images from this location
      for (const review of location.reviews) {
        if (review.imageUrl) {
          try {
            await imageService.deleteImage(review.imageUrl, "reviews");
          } catch (error) {
            console.error("Error deleting review image:", error);
          }
        }
      }
    }

    // Delete user's reviews and their images from other locations
    const locationsWithUserReviews = await Location.find({
      "reviews.user": userId,
    });

    for (const location of locationsWithUserReviews) {
      const userReviews = location.reviews.filter(
        (review) => review.user.toString() === userId.toString()
      );

      for (const review of userReviews) {
        if (review.imageUrl) {
          try {
            await imageService.deleteImage(review.imageUrl, "reviews");
          } catch (error) {
            console.error("Error deleting review image:", error);
          }
        }
      }

      location.reviews = location.reviews.filter(
        (review) => review.user.toString() !== userId.toString()
      );

      if (location.reviews.length > 0) {
        const totalRating = location.reviews.reduce((sum, review) => {
          return sum + (review.rating?.overall || 0);
        }, 0);

        location.ratings.average = totalRating / location.reviews.length;
        location.ratings.count = location.reviews.length;

        const distribution = {
          10: 0,
          9: 0,
          8: 0,
          7: 0,
          6: 0,
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };

        location.reviews.forEach((review) => {
          if (review.rating?.overall) {
            const rating = Math.round(review.rating.overall);
            if (rating >= 1 && rating <= 10) {
              distribution[rating as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10]++;
            }
          }
        });

        location.ratings.distribution = distribution;
      } else {
        location.ratings.average = 0;
        location.ratings.count = 0;
        location.ratings.distribution = {
          10: 0,
          9: 0,
          8: 0,
          7: 0,
          6: 0,
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        };
      }

      await location.save();
    }

    await Location.deleteMany({ createdBy: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Kullanıcı başarıyla silindi" });
  } catch (error: any) {
    res.status(500).json({
      message: "Kullanıcı silinirken hata oluştu",
      error: error.message,
    });
  }
};

// Kullanıcıyı takip etme
export const followUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "Kendinizi takip edemezsiniz" });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı zaten takip ediliyor mu kontrol et
    const userToFollowId = new mongoose.Types.ObjectId(userId);
    if (currentUser.following.some((id) => id.equals(userToFollowId))) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcıyı zaten takip ediyorsunuz" });
    }

    // Takip et
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: userToFollowId },
    });

    // Takipçi olarak ekle
    const currentUserId_obj = new mongoose.Types.ObjectId(currentUserId);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: currentUserId_obj },
    });

    return res
      .status(200)
      .json({ message: "Kullanıcı başarıyla takip edildi" });
  } catch (error) {
    console.error("Kullanıcı takip hatası:", error);
    return res
      .status(500)
      .json({ message: "Kullanıcı takip edilirken bir hata oluştu" });
  }
};

// Kullanıcı takibini bırakma
export const unfollowUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Yetkilendirme hatası" });
    }

    if (userId === currentUserId) {
      return res
        .status(400)
        .json({ message: "Kendinizi takipten çıkaramazsınız" });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kullanıcı takip ediliyor mu kontrol et
    const userToUnfollowId = new mongoose.Types.ObjectId(userId);
    if (!currentUser.following.some((id) => id.equals(userToUnfollowId))) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcıyı takip etmiyorsunuz" });
    }

    // Takibi bırak
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userToUnfollowId },
    });

    // Takipçilerden çıkar
    const currentUserId_obj = new mongoose.Types.ObjectId(currentUserId);
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId_obj },
    });

    return res
      .status(200)
      .json({ message: "Kullanıcı takibi başarıyla bırakıldı" });
  } catch (error) {
    console.error("Kullanıcı takibi bırakma hatası:", error);
    return res
      .status(500)
      .json({ message: "Kullanıcı takibi bırakılırken bir hata oluştu" });
  }
};

// Takip edilen kullanıcıları getirme
export const getFollowing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "following",
      "username name imageUrl"
    );
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json({ following: user.following });
  } catch (error) {
    console.error("Takip edilen kullanıcıları getirme hatası:", error);
    return res.status(500).json({
      message: "Takip edilen kullanıcılar getirilirken bir hata oluştu",
    });
  }
};

// Takipçileri getirme
export const getFollowers = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "followers",
      "username name imageUrl"
    );
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    return res.status(200).json({ followers: user.followers });
  } catch (error) {
    console.error("Takipçileri getirme hatası:", error);
    return res
      .status(500)
      .json({ message: "Takipçiler getirilirken bir hata oluştu" });
  }
};
