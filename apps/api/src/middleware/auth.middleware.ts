import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

interface AuthUser {
  _id: string;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Yetkilendirme token'ı bulunamadı" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = {
      _id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(403).json({ message: "Geçersiz token" });
  }
};

export const checkRole = (roles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Yetkilendirme gerekli" });
        return;
      }
      if (!roles.includes(req.user.role)) {
        res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
        return;
      }

      next();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Yetkilendirme kontrolü sırasında hata oluştu" });
    }
  };
};
