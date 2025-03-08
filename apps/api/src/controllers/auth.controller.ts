import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import { User, IUser } from "../models/user.model";
import { sendVerificationEmail } from "../services/email.service";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h";

interface JwtPayload {
  _id: string;
  username: string;
  role: string;
}

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, name } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        message:
          existingUser.email === email
            ? "Bu email adresi zaten kullanımda"
            : "Bu kullanıcı adı zaten kullanımda",
      });
      return;
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      username,
      email,
      password,
      name,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    }) as IUser & { _id: mongoose.Types.ObjectId };

    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken, username);
    } catch (emailError) {
      console.error("Email gönderme hatası:", emailError);
    }

    const payload: JwtPayload = {
      _id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message:
        "Kullanıcı başarıyla oluşturuldu. Lütfen email adresinizi doğrulayın.",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Kullanıcı oluşturulurken bir hata oluştu",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = (await User.findOne({
      $or: [{ email: username }, { username }],
    })) as IUser & { _id: mongoose.Types.ObjectId };

    if (!user) {
      res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const payload: JwtPayload = {
      _id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({
      message: "Giriş başarılı",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Giriş yapılırken bir hata oluştu",
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: "Başarıyla çıkış yapıldı" });
  } catch (error: any) {
    res.status(500).json({
      message: "Çıkış yapılırken bir hata oluştu",
      error: error.message,
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    const user = (await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    })) as IUser & { _id: mongoose.Types.ObjectId };

    if (!user) {
      res.status(400).json({
        message: "Geçersiz veya süresi dolmuş doğrulama bağlantısı",
      });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      message: "Email adresiniz başarıyla doğrulandı",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Email doğrulama işlemi sırasında bir hata oluştu",
      error: error.message,
    });
  }
};

export const resendVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(404)
        .json({ message: "Bu email adresi ile kayıtlı kullanıcı bulunamadı" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "Bu email adresi zaten doğrulanmış" });
      return;
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken, user.username);

    res.json({
      message:
        "Doğrulama emaili tekrar gönderildi. Lütfen email kutunuzu kontrol edin.",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Doğrulama emaili gönderilirken bir hata oluştu",
      error: error.message,
    });
  }
};
