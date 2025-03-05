import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";

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

    // Remove sensitive fields from update data
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

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      res.status(401).json({ message: "Mevcut şifre hatalı" });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

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
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
      return;
    }

    // Verify password before deletion
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Şifre hatalı" });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "Hesap başarıyla silindi" });
  } catch (error: any) {
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
      // For security reasons, don't reveal if email exists
      res.json({
        message: "Şifre sıfırlama talimatları email adresinize gönderildi",
      });
      return;
    }

    // Generate password reset token
    const resetToken = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(resetToken, salt);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset token
    // For now, just return the token in response
    res.json({
      message: "Şifre sıfırlama talimatları email adresinize gönderildi",
      // Remove this in production
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

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, resetToken, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      res.status(400).json({
        message: "Geçersiz veya süresi dolmuş şifre sıfırlama talebi",
      });
      return;
    }

    // Check if token has expired
    if (user.resetPasswordExpires < new Date()) {
      res
        .status(400)
        .json({ message: "Şifre sıfırlama talebinin süresi dolmuş" });
      return;
    }

    // Verify reset token
    const isValidToken = await bcrypt.compare(
      resetToken,
      user.resetPasswordToken
    );
    if (!isValidToken) {
      res.status(400).json({ message: "Geçersiz şifre sıfırlama kodu" });
      return;
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: "Şifre başarıyla sıfırlandı" });
  } catch (error: any) {
    res.status(500).json({
      message: "Şifre sıfırlanırken hata oluştu",
      error: error.message,
    });
  }
};
