import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h";

interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

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

    const user = new User({
      username,
      email,
      password,
      name,
    });

    await user.save();

    const payload: JwtPayload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
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

    const user = await User.findOne({
      $or: [{ email: username }, { username }],
    });

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
      id: user._id.toString(),
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
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Giriş yapılırken bir hata oluştu",
      error: error.message,
    });
  }
};
