import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import { Location } from "../models/location.model";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    role: string;
  };
}

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?._id;
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

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const updateData = req.body;

    delete updateData.password;
    delete updateData.role;

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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;
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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

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

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Şifre hatalı" });
      return;
    }

    // Kullanıcının oluşturduğu mekanları sil
    const deletedLocations = await Location.deleteMany({ createdBy: userId });
    console.log(`${deletedLocations.deletedCount} mekan silindi`);

    // Kullanıcının yaptığı değerlendirmeleri içeren mekanları bul
    const locationsWithUserReviews = await Location.find({
      "reviews.user": userId,
    });

    // Her bir mekan için kullanıcının değerlendirmelerini kaldır
    for (const location of locationsWithUserReviews) {
      // Kullanıcının değerlendirmelerini filtrele
      location.reviews = location.reviews.filter(
        (review) => review.user.toString() !== userId.toString()
      );

      // Değerlendirme istatistiklerini güncelle
      if (location.reviews.length > 0) {
        const totalRating = location.reviews.reduce((sum, review) => {
          return sum + (review.rating?.overall || 0);
        }, 0);

        location.ratings.average = totalRating / location.reviews.length;
        location.ratings.count = location.reviews.length;

        // Dağılımı sıfırla
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

        // Yeni dağılımı hesapla
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
        // Değerlendirme kalmadıysa sıfırla
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

    console.log(
      `${locationsWithUserReviews.length} mekandan kullanıcı değerlendirmeleri kaldırıldı`
    );

    // Kullanıcıyı sil
    await User.findByIdAndDelete(userId);

    res.json({
      message: "Hesap başarıyla silindi",
      details: {
        deletedLocations: deletedLocations.deletedCount,
        updatedLocationsWithReviews: locationsWithUserReviews.length,
      },
    });
  } catch (error: any) {
    console.error("Hesap silme hatası:", error);
    res
      .status(500)
      .json({ message: "Hesap silinirken hata oluştu", error: error.message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        message: "Şifre sıfırlama talimatları email adresinize gönderildi",
      });
      return;
    }

    const resetToken = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(resetToken, salt);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    // TODO: Send email with reset token
    res.json({
      message: "Şifre sıfırlama talimatları email adresinize gönderildi",
      debug: {
        resetToken,
        userId: user._id,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Şifre sıfırlama işlemi başlatılırken hata oluştu",
      error: error.message,
    });
  }
};

export const updateUserRole = async (
  req: AuthenticatedRequest,
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
        _id: user._id,
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
